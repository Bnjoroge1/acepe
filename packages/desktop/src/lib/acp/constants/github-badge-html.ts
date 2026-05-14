/** Discriminated union for GitHub references rendered by GitHubBadge. */
export type GitHubReference =
	| { type: "pr"; owner: string; repo: string; number: number }
	| { type: "commit"; sha: string; owner?: string; repo?: string }
	| { type: "issue"; owner: string; repo: string; number: number };

export function getGitHubURL(ref: GitHubReference): string {
	if (ref.type === "pr") {
		return `https://github.com/${ref.owner}/${ref.repo}/pull/${ref.number}`;
	}

	if (ref.type === "commit") {
		if (ref.owner && ref.repo) {
			return `https://github.com/${ref.owner}/${ref.repo}/commit/${ref.sha}`;
		}
		return "";
	}

	return `https://github.com/${ref.owner}/${ref.repo}/issues/${ref.number}`;
}
