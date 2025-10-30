import { GitCliRepoProvider } from "./git.provider";

async function test() {
  console.log(" Starting test...");

  const git = new GitCliRepoProvider();
  const repoUrl = "https://github.com/octocat/Hello-World.git";
  const ref = "master";

  try {
    console.log(" Resolving commit...");
    const sha = await git.resolveCommit(repoUrl, ref);
    console.log(" SHA:", sha);

    console.log(" Fetching snapshot...");
    const snap = await git.fetchSnapshot(repoUrl, sha);
    console.log(" Repo cloned to:", snap.path);
  } catch (err: any) {
    console.error(" Error:", err.message);
  }
}

test();
