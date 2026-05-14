<script lang="ts">
	import StreamdownMarkdown from "../streamdown-markdown/streamdown-markdown.svelte";

	interface Props {
		content: string;
		class?: string;
		scrollable?: boolean;
		/** Text size class for the markdown content (e.g. "text-sm", "text-xs"). Defaults to "text-sm". */
		textSize?: string;
		/** Padding class applied to the rendered markdown wrapper. Defaults to "p-6". */
		contentPaddingClass?: string;
		/** Preserved for API compatibility; Streamdown handles render failures internally. */
		errorMessage?: (error: string) => string;
		/**
		 * Preserved for API compatibility while Streamdown owns markdown presentation.
		 * File icon rendering will move through Streamdown-specific enrichment seams.
		 */
		iconBasePath?: string;
	}

	let {
		content,
		class: className = "",
		scrollable = false,
		textSize = "text-sm",
		contentPaddingClass = "p-6",
		errorMessage: _errorMessage,
		iconBasePath: _iconBasePath,
	}: Props = $props();
</script>

<div
	class="min-w-0 max-w-full overflow-x-hidden overflow-y-auto {scrollable
		? 'markdown-display-scrollable h-full w-full'
		: ''} {className}"
>
	<StreamdownMarkdown
		markdown={content}
		class="min-w-0 max-w-full {contentPaddingClass} {textSize} leading-relaxed text-foreground"
	/>
</div>
