import { GitCliRepoProvider } from "./git/git.provider"; 

const provider = new GitCliRepoProvider();

/**
 * Activity 1: Resolves a git ref (branch, tag, or SHA) to a specific commit SHA.
 */
export async function resolveCommit(repoUrl: string, ref: string): Promise<string> {

  return provider.resolveCommit(repoUrl, ref);
}

/**
 * Activity 2: Fetches a shallow snapshot of a specific commit SHA.
 */
export async function fetchSnapshot(repoUrl: string, sha: string): Promise<{ path: string }> {
  return provider.fetchSnapshot(repoUrl, sha);
}

