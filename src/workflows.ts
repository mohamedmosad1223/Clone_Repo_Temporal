import { proxyActivities } from "@temporalio/workflow";
 import type { CloneInput, CloneResult } from "./interfaces";

import * as activities from "./activities";
const { resolveCommit, fetchSnapshot } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minute", 
  retry: { 
     maximumAttempts: 3,
     initialInterval: "2s" 
  }
});


export async function CloneRepoWorkflow(
  input: CloneInput
): Promise<CloneResult> {

  console.log(`Starting workflow for ${input.repoUrl} @ ${input.ref}`);

  const sha = await resolveCommit(input.repoUrl, input.ref);

  console.log(`Resolved SHA: ${sha}`);

  const { path } = await fetchSnapshot(input.repoUrl, sha);

  console.log(`Snapshot fetched to: ${path}`);

  return { sha, path };
}