import { proxyActivities } from "@temporalio/workflow";
import type { CloneInput, CloneResult } from "./interfaces";
import type * as activities from "./activities";

const { cloneRepo } = proxyActivities<typeof activities>({
  startToCloseTimeout: "5 minute",
});

export async function CloneRepoWorkflow(
  input: CloneInput
): Promise<CloneResult> {
  return await cloneRepo(input);
}
