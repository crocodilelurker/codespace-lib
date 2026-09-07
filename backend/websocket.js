import { WebSocket, WebSocketServer } from "ws";
import * as Y from "yjs";
import * as encoding from "lib0/encoding.js";
import * as decoding from "lib0/decoding.js";
import * as syncProtocol from "y-protocols/sync.js";
import * as awarenessProtocol from "y-protocols/awareness.js";
import { userAllowed } from "./utils/permission.js";
import { getDocById, updateDoc } from "./services/document.service.js";

const rooms = new Map();
const roomInitPromises = new Map();

const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;
const messageQueryAwareness = 3;

async function getOrCreateRoom(roomid) {
    if (rooms.has(roomid)) {
        return rooms.get(roomid);
    }

    if (roomInitPromises.has(roomid)) {
        return await roomInitPromises.get(roomid);
    }

    const initPromise = (async () => {
        try {
            const doc = new Y.Doc();
            const existingDoc = await getDocById(roomid);
            const awareness = new awarenessProtocol.Awareness(doc);
            if (existingDoc?.content) {
                const ytext = doc.getText("monaco");
                ytext.insert(0, existingDoc.content);
                console.log("hydrated the doc from database");
            }

            const room = {
                doc,
                awareness,
                clients: new Set(),
                saveTimeout: null
            };

            // Broadcast document updates to other clients in this room
            doc.on('update', (update, origin) => {
                const encoder = encoding.createEncoder();
                encoding.writeVarUint(encoder, messageSync);
                syncProtocol.writeUpdate(encoder, update);
                const message = encoding.toUint8Array(encoder);

                for (const client of room.clients) {
                    if (client !== origin && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                }

                // Debounced save to MongoDB
                clearTimeout(room.saveTimeout);
                room.saveTimeout = setTimeout(async () => {
                    const currentText = doc.getText("monaco").toString();
                    try {
                        const d = await getDocById(roomid);
                        if (d) {
                            const saveResult = await updateDoc(d, undefined, undefined, currentText);
                            if (saveResult)
                                console.log("doc saved");
                        }
                    } catch (error) {
                        console.error("Error while saving to db", error);
                    }
                }, 2000);
            });

            // Broadcast awareness (presence, cursor, selection) updates to clients in this room
            awareness.on('update', ({ added, updated, removed }, origin) => {
                const changedClients = added.concat(updated, removed);
                const encoder = encoding.createEncoder();
                encoding.writeVarUint(encoder, messageAwareness);
                encoding.writeVarUint8Array(
                    encoder,
                    awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
                );
                const message = encoding.toUint8Array(encoder);

                for (const client of room.clients) {
                    if (client !== origin && client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                }
            });

            rooms.set(roomid, room);
            console.log(" room created " + roomid);
            return room;
        } finally {
            roomInitPromises.delete(roomid);
        }
    })();

    roomInitPromises.set(roomid, initPromise);
    return await initPromise;
}

export const initWebSocket = async (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (socket, request) => {
        const clientIp = request.socket.remoteAddress;
        console.log(`New Connection establish by ${clientIp}`);

        const url = new URL(request.url, `http://${request.headers.host}`);
        const roomid = url.searchParams.get('room');
        const token = url.searchParams.get('token');
        if (!token || !roomid) {
            socket.close(4003, 'field undefined');
            return;
        }

        // Verify user authentication and permissions
        const result = await userAllowed(roomid, token);
        if (!result || !result.isAllowed) {
            socket.close(4003, result?.error || 'Access denied');
            return;
        }

        const room = await getOrCreateRoom(roomid);
        room.clients.add(socket);
        console.log(`Client joined room ${roomid} (role: ${result.role || 'viewer'}, write: ${result.ableToWrite})`);

        // Track clientIDs associated with this connection for awareness cleanup
        const socketClientIDs = new Set();
        const awarenessChangeHandler = ({ added, updated, removed }, origin) => {
            if (origin === socket) {
                added.forEach(id => socketClientIDs.add(id));
                updated.forEach(id => socketClientIDs.add(id));
                removed.forEach(id => socketClientIDs.delete(id));
            }
        };
        room.awareness.on('change', awarenessChangeHandler);

        // 1. Send SyncStep 1 to client so client replies with any missing state
        const encoderSync = encoding.createEncoder();
        encoding.writeVarUint(encoderSync, messageSync);
        syncProtocol.writeSyncStep1(encoderSync, room.doc);
        socket.send(encoding.toUint8Array(encoderSync));

        // 2. Send current awareness states if any exist
        const awarenessStates = room.awareness.getStates();
        if (awarenessStates.size > 0) {
            const encoderAwareness = encoding.createEncoder();
            encoding.writeVarUint(encoderAwareness, messageAwareness);
            encoding.writeVarUint8Array(
                encoderAwareness,
                awarenessProtocol.encodeAwarenessUpdate(
                    room.awareness,
                    Array.from(awarenessStates.keys())
                )
            );
            socket.send(encoding.toUint8Array(encoderAwareness));
        }

        socket.on('message', (message, isBinary) => {
            if (!isBinary || !message || message.length < 1)
                return null;

            try {
                const raw = new Uint8Array(message);
                const decoder = decoding.createDecoder(raw);
                const encoder = encoding.createEncoder();
                const messageType = decoding.readVarUint(decoder);

                switch (messageType) {
                    case messageSync: {
                        encoding.writeVarUint(encoder, messageSync);
                        const syncMessageType = decoding.peekVarUint(decoder);

                        // Block write updates if user only has viewer permissions
                        if (syncMessageType !== syncProtocol.messageYjsSyncStep1 && !result.ableToWrite) {
                            console.warn(`Write denied for user in room ${roomid}`);
                            break;
                        }

                        syncProtocol.readSyncMessage(decoder, encoder, room.doc, socket);

                        // If readSyncMessage produced a reply (e.g. SyncStep2 in response to SyncStep1)
                        if (encoding.length(encoder) > 1) {
                            socket.send(encoding.toUint8Array(encoder));
                        }
                        break;
                    }

                    case messageAwareness: {
                        awarenessProtocol.applyAwarenessUpdate(
                            room.awareness,
                            decoding.readVarUint8Array(decoder),
                            socket
                        );
                        break;
                    }

                    case messageQueryAwareness: {
                        const encoderAwareness = encoding.createEncoder();
                        encoding.writeVarUint(encoderAwareness, messageAwareness);
                        encoding.writeVarUint8Array(
                            encoderAwareness,
                            awarenessProtocol.encodeAwarenessUpdate(
                                room.awareness,
                                Array.from(room.awareness.getStates().keys())
                            )
                        );
                        socket.send(encoding.toUint8Array(encoderAwareness));
                        break;
                    }
                }
            } catch (error) {
                console.error("Error processing message:", error);
                return null;
            }
        });

        socket.on('close', async () => {
            room.clients.delete(socket);
            room.awareness.off('change', awarenessChangeHandler);
            console.log('client dced');

            // Clean up presence/cursor on remote clients
            if (socketClientIDs.size > 0) {
                awarenessProtocol.removeAwarenessStates(
                    room.awareness,
                    Array.from(socketClientIDs),
                    socket
                );
            }

            if (room.clients.size === 0) {
                clearTimeout(room.saveTimeout);
                const currentText = room.doc.getText("monaco").toString();
                try {
                    const doc = await getDocById(roomid);
                    if (doc) {
                        const saveResult = await updateDoc(doc, undefined, undefined, currentText);
                        if (saveResult)
                            console.log("doc saved");
                    }
                } catch (error) {
                    console.error("Error while saving to db", error);
                }

                // Check again to ensure no new client connected while the db save was pending
                if (room.clients.size === 0) {
                    room.awareness.destroy();
                    room.doc.destroy();
                    rooms.delete(roomid);
                    console.log('Room destroyed ' + roomid);
                }
            }
        });

        socket.on('error', (err) => {
            console.error('error in file', err);
        });
    });
    return wss;
};