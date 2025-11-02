import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { CloneRepoWorkflow } from '../workflows';
import * as activities from '../activities';
import assert from 'assert';

describe('CloneRepoWorkflow FULL integration', () => {
  jest.setTimeout(120_000);
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  afterAll(async () => {
    await testEnv?.teardown();
  });

  it('successfully runs the full workflow and returns SHA + path', async () => {
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
        args: [
          {
            repoUrl: 'https://github.com/octocat/Hello-World.git',
            ref: 'master',
          },
        ],
        workflowId: `clone-full-${Date.now()}`,
        taskQueue,
      })
    );

    expect(result.sha).toBeDefined();
    expect(result.path).toBeDefined();
    expect(result.sha.length).toBe(40);
    console.log('✅ Full Workflow (Integration) result:', result);
  });
});
