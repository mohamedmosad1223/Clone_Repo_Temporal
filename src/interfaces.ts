export interface CloneInput {
  repoUrl: string;
  ref: string;
}

export interface CloneResult {
  sha: string;
  path: string;
}
