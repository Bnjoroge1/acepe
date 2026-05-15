<script lang="ts">
import { ReviewWorkspace, resolveReviewWorkspaceSelectedIndex } from "@acepe/ui/agent-panel";

import type { ModifiedFilesState } from "../../../types/modified-files-state.js";
import type { ReviewDiffDensity } from "../../modified-files/components/review-diff-view-state.svelte.js";
import AgentPanelReviewContent from "./agent-panel-review-content.svelte";
import { buildReviewWorkspaceFilesFromSessionState } from "./review-workspace-model.js";

const REVIEW_WORKSPACE_EMPTY_STATE_LABEL = "Nothing to review";

interface Props {
	reviewFilesState: ModifiedFilesState;
	selectedFileIndex: number;
	sessionId?: string | null;
	projectPath?: string | null;
	isActive?: boolean;
	onClose: () => void;
	onFileIndexChange: (index: number) => void;
	showHeader?: boolean;
	compact?: boolean;
	diffDensity?: ReviewDiffDensity;
}

let {
	reviewFilesState,
	selectedFileIndex,
	sessionId = null,
	projectPath = null,
	isActive = true,
	onClose,
	onFileIndexChange,
	showHeader = true,
	compact = false,
	diffDensity = "default",
}: Props = $props();

const reviewWorkspaceFiles = $derived.by(() =>
	buildReviewWorkspaceFilesFromSessionState(reviewFilesState, sessionId)
);

const reviewWorkspaceSelectedIndex = $derived.by(() =>
	resolveReviewWorkspaceSelectedIndex(reviewWorkspaceFiles, selectedFileIndex)
);
</script>

<ReviewWorkspace
	files={reviewWorkspaceFiles}
	selectedFileIndex={reviewWorkspaceSelectedIndex}
	{onClose}
	onFileSelect={onFileIndexChange}
	headerLabel={"Review Changes"}
	closeButtonLabel={"Back"}
	emptyStateLabel={REVIEW_WORKSPACE_EMPTY_STATE_LABEL}
	{showHeader}
	{compact}
>
	{#snippet content()}
		<AgentPanelReviewContent
			modifiedFilesState={reviewFilesState}
			selectedFileIndex={reviewWorkspaceSelectedIndex ?? 0}
			{sessionId}
			{projectPath}
			{isActive}
			{diffDensity}
			{onClose}
			{onFileIndexChange}
		/>
	{/snippet}
</ReviewWorkspace>
