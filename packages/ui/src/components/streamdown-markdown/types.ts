import type { StreamdownProps } from "streamdown";

export type StreamdownMarkdownMode = "static" | "streaming";
export type StreamdownMarkdownAnimation = StreamdownProps["animated"];

export interface StreamdownTokenRevealTiming {
	readonly revealCount: number;
	readonly revealedCharCount: number;
	readonly baselineMs: number;
	readonly tokStepMs: number;
	readonly tokFadeDurMs: number;
	readonly mode: "smooth" | "instant";
}
