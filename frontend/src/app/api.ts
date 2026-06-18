import axiosInstance from "./api/axiosInstance";
import type {
  ExecuteRequest,
  ExecuteResponse,
  Execution,
  Project,
  Version,
} from "./types";

// ─── Projects ────────────────────────────────────────────────────────────────

export const getProjects = async (): Promise<Project[]> => {
  const { data } = await axiosInstance.get<Project[]>("/api/projects");
  return data;
};

export const getProject = async (id: string): Promise<Project> => {
  const { data } = await axiosInstance.get<Project>(`/api/projects/${id}`);
  return data;
};

export const createProject = async (
  payload: Pick<Project, "title" | "language" | "currentCode">
): Promise<Project> => {
  const { data } = await axiosInstance.post<Project>("/api/projects", payload);
  return data;
};

export const updateProject = async (
  id: string,
  payload: Partial<Pick<Project, "title" | "language" | "currentCode">>
): Promise<Project> => {
  const { data } = await axiosInstance.put<Project>(
    `/api/projects/${id}`,
    payload
  );
  return data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/projects/${id}`);
};

// ─── Versions ────────────────────────────────────────────────────────────────

export const getVersions = async (projectId: string): Promise<Version[]> => {
  const { data } = await axiosInstance.get<Version[]>(
    `/api/versions/${projectId}`
  );
  return data;
};

export const getVersion = async (versionId: string): Promise<Version> => {
  const { data } = await axiosInstance.get<Version>(
    `/api/versions/single/${versionId}`
  );
  return data;
};

// FIX: was POST /versions/:projectId — correct route is /versions/:projectId/save
export const createVersion = async (
  projectId: string,
  code: string
): Promise<Version> => {
  const { data } = await axiosInstance.post<Version>(
    `/api/versions/${projectId}/save`,
    { code }
  );
  return data;
};

// FIX: was POST /projects/:projectId/restore/:versionId
//      correct route is POST /versions/:projectId/restore/:versionId
export const restoreVersion = async (
  projectId: string,
  versionId: string
): Promise<Project> => {
  const { data } = await axiosInstance.post<Project>(
    `/api/versions/${projectId}/restore/${versionId}`
  );
  return data;
};

// ─── Execute ─────────────────────────────────────────────────────────────────

export const executeCode = async (
  payload: ExecuteRequest
): Promise<ExecuteResponse> => {
  const { data } = await axiosInstance.post<ExecuteResponse>(
    "/api/execute",
    payload
  );
  return data;
};

// ─── Execution History ───────────────────────────────────────────────────────

export const getExecutions = async (): Promise<Execution[]> => {
  const { data } = await axiosInstance.get<Execution[]>("/api/executions");
  return data;
};

export const getExecution = async (jobId: string): Promise<Execution> => {
  const { data } = await axiosInstance.get<Execution>(
    `/api/executions/${jobId}`
  );
  return data;
};

export const getProjectExecutions = async (
  projectId: string
): Promise<Execution[]> => {
  const { data } = await axiosInstance.get<Execution[]>(
    `/api/executions/project/${projectId}`
  );
  return data;
};

// NEW: was missing — backend has GET /api/executions/user/:userId
export const getUserExecutions = async (
  userId: string
): Promise<Execution[]> => {
  const { data } = await axiosInstance.get<Execution[]>(
    `/api/executions/user/${userId}`
  );
  return data;
};