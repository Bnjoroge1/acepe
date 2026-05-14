import { describe, expect, it } from "bun:test";

import { countWordsInMarkdown } from "../../index.js";

describe("countWordsInMarkdown", () => {
	it("counts prose words while treating inline code and styled spans as atomic slots", () => {
		expect(countWordsInMarkdown("**hello world** after `pwd`")).toBe(3);
		expect(countWordsInMarkdown("one\ntwo three")).toBe(3);
	});

	it("counts fenced code as one slot without counting code contents", () => {
		expect(countWordsInMarkdown("before\n\n```ts\nconst answer = 42;\n```\n\nafter")).toBe(3);
	});
});
