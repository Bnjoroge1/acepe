import { cleanup, render, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import AgentToolEditDiff from "../agent-tool-edit-diff.svelte";

interface Deferred {
	readonly promise: Promise<void>;
	readonly resolve: () => void;
}

const renderedMarkers: string[] = [];
const cleanedMarkers: string[] = [];

function createDeferred(): Deferred {
	let resolvePromise: () => void = () => {};
	const promise = new Promise<void>((resolve) => {
		resolvePromise = resolve;
	});
	return {
		promise,
		resolve: resolvePromise,
	};
}

async function flushMicrotasks(): Promise<void> {
	await Promise.resolve();
	await Promise.resolve();
}

vi.mock("svelte", async () => {
	const { createRequire } = await import("node:module");
	const { dirname, join } = await import("node:path");
	const require = createRequire(import.meta.url);
	const svelteClientPath = join(
		dirname(require.resolve("svelte/package.json")),
		"src/index-client.js"
	);

	return import(/* @vite-ignore */ svelteClientPath);
});

vi.mock("@pierre/diffs", () => {
	class MockFileDiff {
		private marker = "";

		render(input: { fileDiff: { marker: string } }): void {
			this.marker = input.fileDiff.marker;
			renderedMarkers.push(this.marker);
		}

		cleanUp(): void {
			cleanedMarkers.push(this.marker);
		}
	}

	return {
		parseDiffFromFile: (
			_oldFile: { readonly contents: string },
			newFile: { readonly contents: string }
		) => {
			return {
				marker: newFile.contents,
			};
		},
		FileDiff: MockFileDiff,
	};
});

afterEach(() => {
	cleanup();
	renderedMarkers.length = 0;
	cleanedMarkers.length = 0;
});

describe("AgentToolEditDiff", () => {
	it("does not let an older async render clean or replace a newer diff", async () => {
		const beforeRenderQueue: Deferred[] = [];
		const onBeforeRender = vi.fn(() => {
			const deferred = createDeferred();
			beforeRenderQueue.push(deferred);
			return deferred.promise;
		});

		const view = render(AgentToolEditDiff, {
			oldString: "before",
			newString: "render A",
			fileName: "example.ts",
			isExpanded: true,
			isStreaming: false,
			onBeforeRender,
		});

		await waitFor(() => {
			expect(beforeRenderQueue).toHaveLength(1);
		});

		await view.rerender({
			oldString: "before",
			newString: "render B",
			fileName: "example.ts",
			isExpanded: true,
			isStreaming: false,
			onBeforeRender,
		});

		await waitFor(() => {
			expect(beforeRenderQueue).toHaveLength(2);
		});

		beforeRenderQueue[1]?.resolve();

		await waitFor(() => {
			expect(renderedMarkers).toEqual(["render B"]);
		});

		beforeRenderQueue[0]?.resolve();

		await flushMicrotasks();

		expect(renderedMarkers).toEqual(["render B"]);
		expect(cleanedMarkers).toEqual([]);
	});
});
