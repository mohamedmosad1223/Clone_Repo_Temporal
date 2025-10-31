import { Connection, Client } from "@temporalio/client";

async function start() {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  const handle = await client.workflow.start("CloneRepoWorkflow", {
    workflowId: `clone-${Date.now()}`,
    taskQueue: "clone-queue",
    args: [{
      repoUrl: "https://github.com/mohamedmosad1223/Client_Server.git",
      ref: "main",
    }],
  });

  console.log("Started:", handle.workflowId);
  
  const result = await handle.result();
  console.log("Result:", result);
}

start();
