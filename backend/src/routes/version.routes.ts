import { Router } from "express";
import * as versionController from "../controllers/version.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// CRITICAL FIX: /single/:versionId MUST be registered before /:projectId.
// Express matches routes top-to-bottom. If /:projectId comes first, a request
// to GET /single/abc123 is matched with projectId="single" — the single route
// is then unreachable. Specific static segments must precede dynamic ones.

router.get(
  "/single/:versionId",
  protect,
  versionController.getVersionById
);

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

export default router;