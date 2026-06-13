export interface ExecutionJob {
  jobId: string;
  language: string;
  code: string;
  stdin: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
}