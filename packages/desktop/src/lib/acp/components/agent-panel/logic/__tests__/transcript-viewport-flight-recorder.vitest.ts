import { describe, expect, it } from "vitest";
import { createTranscriptViewportFlightRecorder } from "../transcript-viewport-flight-recorder.js";

describe("TranscriptViewportFlightRecorder", () => {
	it("stays inert while disabled", () => {
		const recorder = createTranscriptViewportFlightRecorder({
			limit: 2,
			isEnabled: () => false,
			now: () => 10,
		});

		recorder.record({
			panelId: "panel-1",
			sessionId: "session-1",
			generation: 0,
			phase: "event",
			eventType: "RowsChanged",
			follow: "following",
			renderer: "primary",
			rowCount: 1,
			anchor: "tail",
			effectTypes: ["RevealTail"],
		});

		expect(recorder.snapshot()).toEqual([]);
	});

	it("keeps a bounded text-free flight history while enabled", () => {
		const recorder = createTranscriptViewportFlightRecorder({
			limit: 2,
			isEnabled: () => true,
			now: () => 42,
		});

		recorder.record({
			panelId: "panel-1",
			sessionId: "session-1",
			generation: 0,
			phase: "event",
			eventType: "RowsChanged",
			follow: "following",
			renderer: "primary",
			rowCount: 1,
			anchor: "tail",
			effectTypes: ["RevealTail"],
		});
		recorder.record({
			panelId: "panel-1",
			sessionId: "session-1",
			generation: 0,
			phase: "anchor",
			source: "user-wheel",
			anchorKey: "row-1",
			anchorOffsetPx: 12,
		});
		recorder.record({
			panelId: "panel-1",
			sessionId: "session-1",
			generation: 0,
			phase: "scroll-write",
			effectType: "ApplyScrollOffset",
			reason: "preserve-anchor",
			scrollOffset: 240,
			scrollSize: 1200,
			viewportSize: 300,
		});

		const snapshot = recorder.snapshot();
		expect(snapshot).toHaveLength(2);
		expect(snapshot.map((record) => record.phase)).toEqual(["anchor", "scroll-write"]);
		expect(snapshot[0]).toMatchObject({
			schemaVersion: 1,
			sequence: 2,
			timestampMs: 42,
			panelId: "panel-1",
			sessionId: "session-1",
			generation: 0,
			phase: "anchor",
			anchorKey: "row-1",
			anchorOffsetPx: 12,
		});
		expect(JSON.stringify(snapshot)).not.toContain("message text");
	});
});
