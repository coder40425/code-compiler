export interface Project {
  _id: string;
  userId: string;
  title: string;
  language: string;
  currentCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Version {
  _id: string;
  projectId: string;
  versionNumber: number;
  code: string;
  createdAt: string;
}

export interface Execution {
  _id: string;
  jobId: string;
  language: string;
  code: string;
  stdin: string;
  stdout: string;
  stderr: string;
  executionTime: number;
  status: "completed" | "runtime_error" | "compile_error" | "timeout";
  userId?: string;
  projectId?: string;
  createdAt: string;
}

export interface ExecuteRequest {
  language: string;
  code: string;
  stdin: string;
  // FIX: userId must be sent so the backend can attach it to the
  // ExecutionHistory document. Without it, user-scoped history is always empty.
  userId?: string;
}

export interface ExecuteResponse {
  success: boolean;
  jobId: string;
  language: string;
  stdout: string;
  stderr: string;
  executionTime: number;
  status: "completed" | "runtime_error" | "compile_error" | "timeout";
}

export type Language = {
  label: string;
  value: string;
  monacoLang: string;
};