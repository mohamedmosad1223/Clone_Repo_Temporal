import { TestWorkflowEnvironment } from '@temporalio/testing';
import { before, after, describe, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import { CloneRepoWorkflow } from '../workflows';
import * as activities from '../activities';
import assert from 'assert';

describe('CloneRepoWorkflow full integration', function()  {
  this.timeout(60000);
  let testEnv: TestWorkflowEnvironment;

  before(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  after(async () => {
    await testEnv?.teardown();
  });

  it('successfully clones repo and returns SHA + path', async function () {
    this.timeout(120_000); // نخليها دقيقتين علشان clone ممكن يطول شوية

    const { client, nativeConnection } = testEnv;
    const taskQueue = 'clone-test-full';

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('../workflows'),
      activities,
    });

    const result = await worker.runUntil(
      client.workflow.execute(CloneRepoWorkflow, {
        args: [{
          repoUrl: 'https://github.com/octocat/Hello-World.git',
          ref: 'master',
        }],
        workflowId: `clone-full-${Date.now()}`,
        taskQueue,
      })
    );

    assert.ok(result.sha, 'Expected SHA to be returned');
    assert.ok(result.path, 'Expected path to be returned');
    console.log('✅ Full Workflow result:', result);
  });
});
