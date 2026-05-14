<script lang="ts">
	import type { Snippet } from "svelte";
	import TextShimmer from "../text-shimmer/text-shimmer.svelte";
	import type { AgentToolStatus } from "./types.js";

	interface Props {
		/** Tool status for semantic color mapping */
		status?: AgentToolStatus;
		/** Disable shimmer while keeping status color */
		disableShimmer?: boolean;
		/** The label text to display */
		children: Snippet;
	}

	let { status = "done", disableShimmer = false, children }: Props = $props();

	const shouldShimmer = $derived(
		!disableShimmer && (status === "running" || status === "pending" || status === "blocked")
	);
</script>

{#if shouldShimmer}
	<TextShimmer class="shrink-0 text-xs">
		{@render children()}
	</TextShimmer>
{:else}
	<span class="shrink-0 text-xs">
		{@render children()}
	</span>
{/if}
