import { Router } from "express";
import { createDocument, getDocumentByUser, getDocumentById, updateDocument, deleteDocument } from "../controllers/document.controller.js";
import { authMiddleware, docOwnerMiddleware } from "../middleware/auth.middle.js";

const documentRouter = Router();

// before let them view we need to check if the doc is public or private
//nxt itr

documentRouter.use(authMiddleware);
documentRouter.post("/create", createDocument);
documentRouter.get("/", getDocumentByUser);
documentRouter.get("/:id", getDocumentById);
documentRouter.put("/:id", docOwnerMiddleware, updateDocument);
documentRouter.delete("/:id", docOwnerMiddleware, deleteDocument);

export default documentRouter;
