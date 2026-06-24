import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

export const executeCSharp = (
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

    const filePath = path.join(workspace, "main.cs");
    fs.writeFileSync(filePath, code);

    const inputPath = path.join(workspace, "input.txt");
    fs.writeFileSync(inputPath, stdin);

    // mcr.microsoft.com/dotnet/sdk includes both the compiler (csc via dotnet)
    // and runtime. We use `dotnet-script` approach via a minimal csproj so
    // users can write standard top-level C# without boilerplate.
    // Simpler: use `dotnet csc` (Roslyn) to compile then mono to run,
    // OR use the dotnet SDK with a temp project.
    // Most reliable single-image approach: dotnet SDK with a temp console project.
    const command =
      `docker run --rm --network=none --memory=512m --cpus=1 -v "${workspace}:/workspace" mcr.microsoft.com/dotnet/sdk:8.0 sh -c "mkdir -p /workspace/proj && cp /workspace/main.cs /workspace/proj/Program.cs && cd /workspace/proj && dotnet new console --force -o . --no-restore > /dev/null 2>&1 && cp /workspace/main.cs /workspace/proj/Program.cs && dotnet run --no-launch-profile < /workspace/input.txt"`;

    const startTime = Date.now();

    // dotnet restore + build on first run takes time — 20s timeout
    exec(command, { timeout: 20000 }, (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;

      try {
        fs.rmSync(workspace, { recursive: true, force: true });
      } catch {}

      if (error?.killed === true || error?.signal === "SIGTERM") {
        return resolve({
          stdout: "",
          stderr: "Execution timed out (20 seconds limit).",
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