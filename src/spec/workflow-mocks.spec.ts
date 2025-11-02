import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker } from '@temporalio/worker';
import { CloneRepoWorkflow } from '../workflows';
import assert from 'assert';

describe('CloneRepoWorkflow with MOCKED activities', () => {
  jest.setTimeout(70000);

  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping();
  });

  afterAll(async () => {
    await testEnv?.teardown();
  });

  it('returns mocked sha and path from the 2 mock activities', async () => {
    const { client, nativeConnection } = testEnv;
    const taskQueue = 'clone-test-mock';

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue,
      workflowsPath: require.resolve('../workflows'),
      activities: {
        resolveCommit: async (repoUrl: string, ref: string) => {
          console.log(`MOCK resolveCommit called with: ${repoUrl}, ${ref}`);
          return 'mocked-sha-from-resolveCommit';
        },
        fetchSnapshot: async (repoUrl: string, sha: string) => {
          console.log(`MOCK fetchSnapshot called with: ${repoUrl}, ${sha}`);
          assert.strictEqual(
            sha,
            'mocked-sha-from-resolveCommit',
            "fetchSnapshot wasn't called with SHA from resolveCommit"
          );
          return { path: '/tmp/mock-path-from-fetchSnapshot' };
        },
      },
    });

    const result = await worker.runUntil(
      client.workflow.execute(CloneRepoWorkflow, {
        args: [
          {
            repoUrl: 'https://fake-repo/test.git',
            ref: 'fake-ref',
          },
        ],
        workflowId: 'test-clone-mock',
        taskQueue,
      })
    );

    expect(result.sha).toBe('mocked-sha-from-resolveCommit');
    expect(result.path).toBe('/tmp/mock-path-from-fetchSnapshot');
    console.log('✅ Mocked Workflow result:', result);
  });
});
