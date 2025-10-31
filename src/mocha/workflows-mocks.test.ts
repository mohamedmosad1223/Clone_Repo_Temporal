import { TestWorkflowEnvironment } from '@temporalio/testing';
import { before, after, describe, it } from 'mocha';
import { Worker } from '@temporalio/worker';
import { CloneRepoWorkflow } from '../workflows'; 
import assert from 'assert';

describe('CloneRepoWorkflow with MOCKED activities', function () {
  this.timeout(70000); 

  let testEnv: TestWorkflowEnvironment;

  before(async () => {
    testEnv = await TestWorkflowEnvironment.createTimeSkipping(); 
  });

  after(async () => {
    await testEnv?.teardown();
  });

  it('returns mocked sha and path from the 2 mock activities', async function () {
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
          assert.strictEqual(sha, 'mocked-sha-from-resolveCommit', "fetchSnapshot wasn't called with SHA from resolveCommit");
          return { path: '/tmp/mock-path-from-fetchSnapshot' };
        },
      },
    });

    const result = await worker.runUntil(
      client.workflow.execute(CloneRepoWorkflow, {
        args: [{
          repoUrl: 'https://fake-repo/test.git',
          ref: 'fake-ref',
        }],
        workflowId: 'test-clone-mock',
        taskQueue,
      })
    );
    
    assert.equal(result.sha, 'mocked-sha-from-resolveCommit');
    assert.equal(result.path, '/tmp/mock-path-from-fetchSnapshot');
    console.log('✅ Mocked Workflow result:', result);
  });
});