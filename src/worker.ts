
import { Worker } from "@temporalio/worker";
import * as activities from "./activities";

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows"), 
    activities, 
    taskQueue: "clone-queue",
  });

  await worker.run();
}

run().catch(console.error);
