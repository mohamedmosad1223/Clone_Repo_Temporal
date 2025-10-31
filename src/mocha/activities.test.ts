import { MockActivityEnvironment } from "@temporalio/testing";
import { describe, it } from "mocha";
import assert from "assert";
import * as activities from "../activities";

describe("Git Activities (Real Network)", function () {
  this.timeout(60000);
  const env = new MockActivityEnvironment();

  const repoUrl = "https://github.com/octocat/Hello-World.git";
  const ref = "master";
  
  let realSha: string; 

  it("1. resolveCommit successfully returns a SHA", async function() { 
    
    
    const resultSha = (await env.run(
      activities.resolveCommit,
      repoUrl,
      ref
    )) as string; 

    assert.ok(resultSha, "Expected SHA to be returned");
    
  
    assert.strictEqual(resultSha.length, 40, "Expected SHA to be 40 chars long"); 
    console.log("✅ Activity (resolveCommit) result:", resultSha);
    realSha = resultSha;
  });


  it("2. fetchSnapshot successfully clones using the SHA", async function() { 
    
    if (!realSha) {

      this.skip(); 
    }

    const result = (await env.run(
      activities.fetchSnapshot,
      repoUrl,
      realSha
    )) as { path: string }; 

    assert.ok(result.path, "Expected path to be returned");
    assert.ok(result.path.includes("repo-"), "Path should be a temp directory");
    console.log("✅ Activity (fetchSnapshot) result:", result.path);
  });
});