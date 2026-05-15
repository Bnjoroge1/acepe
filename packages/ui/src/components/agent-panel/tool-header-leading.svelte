<script lang="ts">
	import type { Snippet } from "svelte";
	import { LoadingIcon } from "../icons/index.js";
	import ToolLabel from "./tool-label.svelte";
	import type { AgentToolKind, AgentToolStatus } from "./types.js";

	interface Props {
		kind?: AgentToolKind;
		status?: AgentToolStatus;
		class?: string;
		children: Snippet;
	}

	let { kind, status = "done", class: className = "", children }: Props = $props();

	const isPending = $derived(status === "pending" || status === "running");
	const isThinking = $derived(kind === "think");
</script>

<div class={`flex items-center gap-2 min-w-0 ${className}`.trim()}>
	{#if isPending && isThinking}
		<span
			data-testid="thinking-header-line"
			class="h-3 w-px shrink-0 rounded-full bg-border/70"
			aria-hidden="true"
		></span>
	{:else if isPending}
		<LoadingIcon class="shrink-0" style="width: 12px; height: 12px;" aria-label="Loading" />
	{/if}
	<ToolLabel {status}>
		{@render children()}
	</ToolLabel>
</div>
