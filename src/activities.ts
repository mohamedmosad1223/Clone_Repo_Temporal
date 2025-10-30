// import { exec } from "child_process";
// import { promisify } from "util";
// import type { CloneInput, CloneResult } from "./interfaces";

// const sh = promisify(exec);

// export async function cloneRepo(input: CloneInput): Promise<CloneResult> {
//   const repoPath = `/tmp/repo-${Date.now()}`;

//   try {
//     await sh(`git clone ${input.repoUrl} ${repoPath}`, { timeout: 60_000 });
//     await sh(`git -C ${repoPath} checkout ${input.ref}`, { timeout: 20_000 });

//     const { stdout } = await sh(
//       `git -C ${repoPath} rev-parse HEAD`,
//       { timeout: 10_000 }
//     );

//     const sha = stdout.trim();

//     return { sha, path: repoPath };
//   } catch (err: any) {
//     await cleanup(repoPath).catch(() => {});
//     throw new Error(`Git failed: ${err.message}`);
//   }
// }

// async function cleanup(path: string) {
//   await sh(`rm -rf ${path}`);
// }





import type { CloneInput, CloneResult } from "./interfaces";
import { GitCliRepoProvider } from "./git/git.provider";

const provider = new GitCliRepoProvider();

export async function cloneRepo(input: CloneInput): Promise<CloneResult> {
  try {
    const sha = await provider.resolveCommit(input.repoUrl, input.ref);
    const { path } = await provider.fetchSnapshot(input.repoUrl, sha);
    return { sha, path };
  } catch (err: any) {
    throw new Error(`Git clone failed: ${err.message}`);
  }
}


