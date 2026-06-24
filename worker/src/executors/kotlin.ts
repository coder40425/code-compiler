import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const executeKotlin = (
  code: string,
  stdin: string = ""
): Promise<{
  stdout: string;
  stderr: string;
  executionTime: number;
  timedOut?: boolean;
}> => {
  return new Promise((resolve) => {
    const jobId = uuidv4();

    const workspace = path.join(process.cwd(), "temp", jobId);
    fs.mkdirSync(workspace, { recursive: true });

    // Kotlin compiler requires the file to be named exactly as the class.
    // Using Main.kt with a top-level main() function works without a class.
    const filePath = path.join(workspace, "main.kt");
    fs.writeFileSync(filePath, code);

    const inputPath = path.join(workspace, "input.txt");
    fs.writeFileSync(inputPath, stdin);

    // kotlinc compiles to a jar, then java -jar runs it.
    // MainKt is the default class name Kotlin generates for top-level main().
    const command =
      `docker run --rm --network=none --memory=512m --cpus=1 -v "${workspace}:/workspace" zenika/kotlin:latest sh -c "kotlinc /workspace/main.kt -include-runtime -d /workspace/main.jar 2>/workspace/compile.err && java -jar /workspace/main.jar < /workspace/input.txt || cat /workspace/compile.err"`;

    const startTime = Date.now();

    exec(command, { timeout: 35000 }, (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;

      try {
        fs.rmSync(workspace, { recursive: true, force: true });
      } catch {}

      if (error?.killed === true || error?.signal === "SIGTERM") {
        return resolve({
          stdout: "",
          stderr: "Execution timed out (30 seconds limit).",
          executionTime,
          timedOut: true,
        });
      }

      if (error) {
        return resolve({
          stdout: "",
          stderr: stderr || error.message,
          executionTime,
        });
      }

      resolve({ stdout, stderr, executionTime });
    });
  });
};