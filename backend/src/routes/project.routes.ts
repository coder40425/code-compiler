import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  protect,
  projectController.createProject
);

router.get(
  "/",
  protect,
  projectController.getAllProjects
);

router.get(
  "/:id",
  protect,
  projectController.getProjectById
);

router.put(
  "/:id",
  protect,
  projectController.updateProject
);

router.delete(
  "/:id",
  protect,
  projectController.deleteProject
);

export default router;