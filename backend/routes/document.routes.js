import { Router } from "express";
import { createDocument, getDocumentByUser, getDocumentById, updateDocument, deleteDocument } from "../controllers/document.controller.js";
import { authMiddleware, docOwnerMiddleware, docWriteMiddleware } from "../middleware/auth.middle.js";

const documentRouter = Router();

documentRouter.use(authMiddleware);
documentRouter.post("/create", createDocument);
documentRouter.get("/", getDocumentByUser);
documentRouter.get("/:id", getDocumentById);
documentRouter.put("/:id", docWriteMiddleware, updateDocument);
documentRouter.delete("/:id", docOwnerMiddleware, deleteDocument);

export default documentRouter;
