import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const executeRuby = (
  code: string,
  stdin: string = ""
): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve) => {
    const jobId = uuidv4();

    const workspace = path.join(
      process.cwd(),
      "temp",
      jobId
    );

    fs.mkdirSync(workspace, { recursive: true });

    const filePath = path.join(workspace, "main.rb");
    fs.writeFileSync(filePath, code);

    const inputPath = path.join(workspace, "input.txt");
    fs.writeFileSync(inputPath, stdin);

    const command =
      `docker run --rm -i -v "${workspace}:/workspace" ruby:3.3 sh -c "ruby /workspace/main.rb < /workspace/input.txt"`;

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