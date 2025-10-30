import { execFile } from "node:child_process";

export function sh(
  cmd: string,
  args: string[] = [],
  cwd?: string,
  timeout = 60_000 
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = execFile(cmd, args, { cwd, timeout }, (err, stdout, stderr) => {
      if (err) {
        const e: any = new Error(stderr || err.message);
        e.code = (err as any).code;
        e.stdout = stdout;
        e.stderr = stderr;
        return reject(e);
      }
      resolve({ stdout: String(stdout), stderr: String(stderr) });
    });

    child.on("error", (e) => {
      reject(new Error(`Failed to execute "${cmd}": ${e.message}`));
    });

    child.on("close", (code, signal) => {
      if (signal === "SIGTERM") {
        reject(new Error(`Process timeout after ${timeout / 1000}s for command: ${cmd}`));
      }
    });
  });
}
