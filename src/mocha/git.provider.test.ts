import { GitCliRepoProvider } from "../git/git.provider";
import * as exec from '../git/git.exec';
import { describe, it, beforeEach, afterEach } from 'mocha';
import assert from 'assert';
import * as sinon from 'sinon';
import { tmpdir } from 'os';


import { LS_REMOTE_HEADS_MAIN, LS_REMOTE_TAG_V1 } from './git.fixtures';

const REPO_URL = "https://example.com/repo.git";

describe('GitCliRepoProvider (Unit Test with Mocks)', function () {
  this.timeout(5000);
  
  let provider: GitCliRepoProvider;
  let shStub: sinon.SinonStub; 

  beforeEach(() => {
    provider = new GitCliRepoProvider();
    shStub = sinon.stub(exec, 'sh');
  });

  afterEach(() => {
    shStub.restore();
  });

  it("resolves sha from explicit ref", async () => {
    const fakeSha = "a1b2c3";
    shStub.resolves({ stdout: `${fakeSha}\trefs/heads/main\n`, stderr: "" });
    
    const sha = await provider.resolveCommit(REPO_URL, "main");

    assert.strictEqual(sha, fakeSha);
    
    
    assert.ok(shStub.calledOnceWithExactly(
      'git', 
      ['ls-remote', REPO_URL, 'main'], 
      undefined, 
      60000 
    ));
  });

  it("resolves sha from heads when ref not found", async () => {
    shStub.onFirstCall().resolves({ stdout: "", stderr: "" }); 
    shStub.onSecondCall().resolves({ stdout: LS_REMOTE_HEADS_MAIN, stderr: "" }); 

    const sha = await provider.resolveCommit(REPO_URL, "main");

    assert.strictEqual(sha, 'a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4');
    assert.strictEqual(shStub.callCount, 2);
  });

  it("resolves sha from tags", async () => {
    shStub.onFirstCall().resolves({ stdout: "", stderr: "" }); 
    shStub.onSecondCall().resolves({ stdout: "", stderr: "" }); 
    shStub.onThirdCall().resolves({ stdout: LS_REMOTE_TAG_V1, stderr: "" }); 

    const sha = await provider.resolveCommit(REPO_URL, "v1.0.0");

    assert.strictEqual(sha, 'e5f6g7h8e5f6g7h8e5f6g7h8e5f6g7h8e5f6g7h8');
    assert.strictEqual(shStub.callCount, 3);
  });

  it("throws on missing ref", async () => {
    shStub.resolves({ stdout: "", stderr: "" });

    await assert.rejects(
      () => provider.resolveCommit(REPO_URL, "y"),
      (err: Error) => {
        assert.match(err.message, /ref not found: y/);
        return true;
      }
    );
    assert.strictEqual(shStub.callCount, 3);
  });

  it("fetches shallow snapshot", async () => {
    const calls: Array<{ args: string[]; cwd?: string }> = [];

    shStub.callsFake(async (cmd: string, args: string[], cwd?: string) => {
      calls.push({ args, cwd });
      return { stdout: "", stderr: "" };
    });

    const out = await provider.fetchSnapshot(REPO_URL, "deadbeef");
    assert.ok(out.path.startsWith(tmpdir()), "Path should be in the OS temp directory");
    assert.ok(out.path.includes("repo-"));
    
    const commandNames = calls.map(c => c.args[0]);
    assert.deepStrictEqual(commandNames, ["init", "remote", "fetch", "checkout"]);
    
    assert.strictEqual(calls[0].cwd, out.path);
    assert.strictEqual(calls[1].cwd, out.path);
    assert.strictEqual(calls[2].cwd, out.path);
    assert.strictEqual(calls[3].cwd, out.path);
  });
});