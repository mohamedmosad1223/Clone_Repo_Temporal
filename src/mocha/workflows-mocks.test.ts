import { TestWorkflowEnvironment } from '@temporalio/testing';
import { before, after, describe, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import { CloneRepoWorkflow } from '../workflows';
import assert from 'assert';

describe('CloneRepoWorkflow with mock activity', function () {
  this.timeout(60000);

  let testEnv: TestWorkflowEnvironment;

  before(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  after(async () => {
    await testEnv?.teardown();
  });

  it('returns mocked sha and path correctly', async function () {
    const { client, nativeConnection } = testEnv;
    const taskQueue = 'clone-test-mock';

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('../workflows'),
      activities: {
        cloneRepo: async () => ({
          sha: 'mocked-sha-123',
          path: '/tmp/mock-path',
        }),
      },
    });

    const result = await worker.runUntil(
      client.workflow.execute(CloneRepoWorkflow, {
        args: [{
          repoUrl: 'https://github.com/octocat/Hello-World.git',
          ref: 'master',
        }],
        workflowId: 'test-clone-mock',
        taskQueue,
      })
    );

    assert.equal(result.sha, 'mocked-sha-123');
    assert.equal(result.path, '/tmp/mock-path');
    console.log(' Mocked Workflow result:', result);
  });
});
