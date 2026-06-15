import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const executeJavaScript = (
  code: string,
  stdin: string = ""
): Promise<{ stdout: string; stderr: string; executionTime: number; timedOut?: boolean }> => {
  return new Promise((resolve) => {
    const jobId = uuidv4();

    const workspace = path.join(
      process.cwd(),
      "temp",
      jobId
    );

    fs.mkdirSync(workspace, { recursive: true });

    const filePath = path.join(workspace, "main.js");
    fs.writeFileSync(filePath, code);

    const inputPath = path.join(workspace, "input.txt");
    fs.writeFileSync(inputPath, stdin);

    const command =
      `docker run --rm --network=none --memory=256m --cpus=1 -i -v "${workspace}:/workspace" node:22 sh -c "node /workspace/main.js < /workspace/input.txt"`;

    const startTime = Date.now();

    exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;

      try {
        fs.rmSync(workspace, {
          recursive: true,
          force: true,
        });
      } catch {}

      if (error?.killed === true || error?.signal === "SIGTERM") {
        return resolve({
          stdout: "",
          stderr: "Execution timed out (5 seconds limit).",
          executionTime,
          timedOut: true,
        });
      }

      if (error) {
        return resolve({
          stdout: "",
          stderr: error.message || stderr,
          executionTime,
        });
      }

      resolve({
        stdout,
        stderr,
        executionTime,
      });
    });
  });
};