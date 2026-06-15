import express from "express";
import {
  getAllExecutions,
  getExecutionByJobId,
  getExecutionsByProject,
  getExecutionsByUser,
} from "../controllers/executionHistory.controller";

const router = express.Router();

router.get("/", getAllExecutions);

router.get(
  "/job/:jobId",
  getExecutionByJobId
);

router.get(
  "/project/:projectId",
  getExecutionsByProject
);

router.get(
  "/user/:userId",
  getExecutionsByUser
);

export default router;