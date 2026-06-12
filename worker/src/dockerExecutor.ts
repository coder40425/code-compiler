import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const executePython = (
  code: string
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const jobId = uuidv4();

    const workspace = path.join(
      process.cwd(),
      "temp",
      jobId
    );

    fs.mkdirSync(workspace, { recursive: true });

    const filePath = path.join(workspace, "main.py");

    fs.writeFileSync(filePath, code);

    const command = `docker run --rm -v "${workspace}:/workspace" python:3.11 python3 /workspace/main.py`;

    exec(command, (error, stdout, stderr) => {
      try {
        fs.rmSync(workspace, {
          recursive: true,
          force: true,
        });
      } catch {}

      if (error) {
        return resolve({
          stdout: "",
          stderr: error.message || stderr,
        });
      }

      resolve({
        stdout,
        stderr,
      });
    });
  });
};