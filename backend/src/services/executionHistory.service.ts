import ExecutionHistory from "../models/ExecutionHistory";

export const getAllExecutions = async () => {
  return await ExecutionHistory.find()
    .sort({ createdAt: -1 });
};

export const getExecutionByJobId = async (
  jobId: string
) => {
  return await ExecutionHistory.findOne({
    jobId,
  });
};

export const getExecutionsByProject = async (
  projectId: string
) => {
  return await ExecutionHistory.find({
    projectId,
  }).sort({ createdAt: -1 });
};

export const getExecutionsByUser = async (
  userId: string
) => {
  return await ExecutionHistory.find({
    userId,
  }).sort({ createdAt: -1 });
};