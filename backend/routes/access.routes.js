import { Router } from "express";
import { authMiddleware, docOwnerMiddleware } from "../middleware/auth.middle.js";
import {
    createAccessMap,
    getAccessMap,
    addCollaborator,
    deleteCollaborator,
    updateCollaborator
} from "../controllers/access.controller.js";

const accessRouter = Router();

accessRouter.use(authMiddleware);

accessRouter.get("/:id", getAccessMap);

accessRouter.post("/:id", docOwnerMiddleware, createAccessMap);
accessRouter.post("/:id/add", docOwnerMiddleware, addCollaborator);
accessRouter.post("/:id/collaborators", docOwnerMiddleware, addCollaborator);
accessRouter.delete("/:id/delete", docOwnerMiddleware, deleteCollaborator);
accessRouter.delete("/:id/collaborators", docOwnerMiddleware, deleteCollaborator);
accessRouter.put("/:id/update", docOwnerMiddleware, updateCollaborator);
accessRouter.put("/:id/collaborators", docOwnerMiddleware, updateCollaborator);

export default accessRouter;

