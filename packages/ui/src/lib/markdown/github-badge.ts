/**
 * Shared constants and utilities for GitHub reference badges.
 * Used by the shared GitHubBadge component.
 */

/** Discriminated union for parsed GitHub references */
export type GitHubReference =
	| { type: "pr"; owner: string; repo: string; number: number }
	| { type: "commit"; sha: string; owner?: string; repo?: string }
	| { type: "issue"; owner: string; repo: string; number: number };

export function getGitHubLabel(ref: GitHubReference): string {
	if (ref.type === "commit") return ref.sha.slice(0, 7);
	return `${ref.owner}/${ref.repo}#${ref.number}`;
}
