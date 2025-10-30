import { MockActivityEnvironment } from "@temporalio/testing";
import { describe, it } from "mocha";
import assert from "assert";
import * as activities from "../activities";
import type { CloneInput, CloneResult } from "../interfaces";

describe("cloneRepo activity", function () {
  this.timeout(60000);


  it("successfully clones and returns sha + path", async () => {
    const env = new MockActivityEnvironment();

    const input: CloneInput = {
      repoUrl: "https://github.com/octocat/Hello-World.git",
      ref: "master",
    };

  
    const result = (await env.run(
      activities.cloneRepo,
      input 
    )) as CloneResult;

    assert.ok(result.sha, "Expected SHA to be returned");
    assert.ok(result.path, "Expected path to be returned");

    console.log("✅ Activity result:", result);
  });
});
