<script lang="ts">
	import { type Snippet } from "svelte";

	import ReviewWorkspaceFileList from "./review-workspace-file-list.svelte";
	import ReviewWorkspaceHeader from "./review-workspace-header.svelte";
	import type { ReviewWorkspaceFileItem } from "./types.js";

	interface Props {
		files: readonly ReviewWorkspaceFileItem[];
		selectedFileIndex?: number | null;
		content?: Snippet;
		onClose?: () => void;
		onFileSelect?: (index: number) => void;
		headerLabel: string;
		emptyStateLabel: string;
		closeButtonLabel?: string;
		showHeader?: boolean;
		compact?: boolean;
	}

	let {
		files,
		selectedFileIndex = null,
		content,
		onClose,
		onFileSelect,
		headerLabel,
		emptyStateLabel,
		closeButtonLabel = "Back",
		showHeader = true,
		compact = false,
	}: Props = $props();

	const showEmptyState = $derived(files.length === 0 || !content);
	const rootClass = $derived(
		compact
			? "flex h-full min-h-0 w-full min-w-0 flex-col gap-1 overflow-hidden bg-card p-1"
			: "flex h-full min-h-0 w-full min-w-0 flex-col gap-2 overflow-hidden bg-card p-2"
	);
	const bodyClass = $derived(
		compact
			? "flex min-h-0 min-w-0 flex-1 gap-1 overflow-hidden"
			: "flex min-h-0 min-w-0 flex-1 gap-2 overflow-hidden"
	);
	const filesPaneClass = $derived(
		compact
			? "flex w-[220px] shrink-0 flex-col overflow-hidden rounded border border-border bg-input/30"
			: "flex w-[280px] shrink-0 flex-col overflow-hidden rounded-md border border-border bg-input/30"
	);
	const contentPaneClass = $derived(
		compact
			? "flex min-h-0 min-w-0 flex-1 overflow-hidden rounded bg-background shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_6px_rgba(0,0,0,0.16)] ring-1 ring-border/60"
			: "flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card"
	);
</script>

<div
	class={rootClass}
	data-testid="review-workspace"
>
	{#if showHeader}
		<ReviewWorkspaceHeader
			label={headerLabel}
			closeButtonLabel={closeButtonLabel}
			fileCount={files.length}
			{onClose}
		/>
	{/if}

	<div class={bodyClass} data-testid="review-workspace-body">
		<aside
			class={filesPaneClass}
			data-testid="review-workspace-files-pane"
		>
			<ReviewWorkspaceFileList
				{files}
				selectedIndex={selectedFileIndex}
				emptyStateLabel={emptyStateLabel}
				onFileSelect={onFileSelect}
			/>
		</aside>

		<section
			class={contentPaneClass}
			data-testid="review-workspace-content-pane"
		>
			{#if showEmptyState}
				<div
					class="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground"
					data-testid="review-workspace-content-empty"
				>
					{emptyStateLabel}
				</div>
			{:else if content}
				<div class="flex min-h-0 min-w-0 flex-1 overflow-hidden" data-testid="review-workspace-content">
					{@render content()}
				</div>
			{/if}
		</section>
	</div>
</div>
