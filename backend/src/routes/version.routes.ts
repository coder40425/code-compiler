import { Router } from "express";
import * as versionController from "../controllers/version.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/:projectId/save",
  protect,
  versionController.createVersion
);

router.post(
  "/:projectId/restore/:versionId",
  protect,
  versionController.restoreVersion
);

router.get(
  "/:projectId",
  protect,
  versionController.getVersionsByProject
);

router.get(
  "/single/:versionId",
  protect,
  versionController.getVersionById
);

export default router;