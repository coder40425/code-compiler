import { Router } from "express";
import * as versionController from "../controllers/version.controller";

const router = Router();

router.post("/:projectId/save", versionController.createVersion);
router.post("/:projectId/restore/:versionId",versionController.restoreVersion);
router.get("/:projectId", versionController.getVersionsByProject);
router.get("/single/:versionId", versionController.getVersionById);

export default router;