export type TranscriptViewportFlightPhase =
	| "event"
	| "effect-scheduled"
	| "effect-applied"
	| "effect-skipped"
	| "anchor"
	| "scroll-write";

export type TranscriptViewportFlightRecordInput = {
	panelId: string;
	sessionId: string | null;
	generation: number;
	phase: TranscriptViewportFlightPhase;
	eventType?: string;
	effectType?: string;
	effectTypes?: readonly string[];
	source?: string;
	reason?: string;
	follow?: "following" | "detached";
	renderer?: string;
	anchor?: string;
	anchorKey?: string;
	anchorOffsetPx?: number;
	rowCount?: number;
	scrollOffset?: number;
	scrollSize?: number;
	viewportSize?: number;
};

export type TranscriptViewportFlightRecord = TranscriptViewportFlightRecordInput & {
	schemaVersion: 1;
	sequence: number;
	timestampMs: number;
};

export type TranscriptViewportFlightRecorder = {
	record(input: TranscriptViewportFlightRecordInput): void;
	snapshot(): readonly TranscriptViewportFlightRecord[];
	clear(): void;
};

export type BrowserTranscriptViewportTraceControls = {
	enable(): void;
	disable(): void;
	dump(): readonly TranscriptViewportFlightRecord[];
	clear(): void;
};

type TranscriptViewportFlightRecorderOptions = {
	limit: number;
	isEnabled(): boolean;
	now?(): number;
};

function defaultNow(): number {
	if (typeof performance !== "undefined") {
		return performance.now();
	}
	return Date.now();
}

function createRecord(
	input: TranscriptViewportFlightRecordInput,
	sequence: number,
	timestampMs: number
): TranscriptViewportFlightRecord {
	return {
		schemaVersion: 1,
		sequence,
		timestampMs,
		panelId: input.panelId,
		sessionId: input.sessionId,
		generation: input.generation,
		phase: input.phase,
		eventType: input.eventType,
		effectType: input.effectType,
		effectTypes: input.effectTypes,
		source: input.source,
		reason: input.reason,
		follow: input.follow,
		renderer: input.renderer,
		anchor: input.anchor,
		anchorKey: input.anchorKey,
		anchorOffsetPx: input.anchorOffsetPx,
		rowCount: input.rowCount,
		scrollOffset: input.scrollOffset,
		scrollSize: input.scrollSize,
		viewportSize: input.viewportSize,
	};
}

export function createTranscriptViewportFlightRecorder(
	options: TranscriptViewportFlightRecorderOptions
): TranscriptViewportFlightRecorder {
	const records: TranscriptViewportFlightRecord[] = [];
	const now = options.now ?? defaultNow;
	let nextSequence = 1;

	return {
		record(input) {
			if (!options.isEnabled()) {
				return;
			}

			records.push(createRecord(input, nextSequence, now()));
			nextSequence += 1;
			while (records.length > options.limit) {
				records.shift();
			}
		},
		snapshot() {
			return records.slice();
		},
		clear() {
			records.length = 0;
		},
	};
}

declare global {
	interface Window {
		__ACEPE_TRANSCRIPT_VIEWPORT_TRACE__?: BrowserTranscriptViewportTraceControls;
	}
}

const TRANSCRIPT_VIEWPORT_TRACE_STORAGE_KEY = "acepe:debug:transcript-viewport";
const DEFAULT_BROWSER_TRACE_LIMIT = 250;

function hasWindow(): boolean {
	return typeof window !== "undefined";
}

function getBrowserStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> | null {
	if (!hasWindow()) {
		return null;
	}

	const storage = window.localStorage;
	if (typeof storage !== "object" || storage === null) {
		return null;
	}
	if (
		typeof storage.getItem !== "function" ||
		typeof storage.setItem !== "function" ||
		typeof storage.removeItem !== "function"
	) {
		return null;
	}
	return storage;
}

function readBrowserTraceEnabled(): boolean {
	const storage = getBrowserStorage();
	if (storage === null) {
		return false;
	}
	return storage.getItem(TRANSCRIPT_VIEWPORT_TRACE_STORAGE_KEY) === "1";
}

let browserTraceEnabled = readBrowserTraceEnabled();

const browserTranscriptViewportFlightRecorder = createTranscriptViewportFlightRecorder({
	limit: DEFAULT_BROWSER_TRACE_LIMIT,
	isEnabled: () => browserTraceEnabled,
});

function setBrowserTraceEnabled(enabled: boolean): void {
	browserTraceEnabled = enabled;
	const storage = getBrowserStorage();
	if (storage === null) {
		return;
	}
	if (enabled) {
		storage.setItem(TRANSCRIPT_VIEWPORT_TRACE_STORAGE_KEY, "1");
		return;
	}
	storage.removeItem(TRANSCRIPT_VIEWPORT_TRACE_STORAGE_KEY);
	browserTranscriptViewportFlightRecorder.clear();
}

function dumpBrowserTrace(): readonly TranscriptViewportFlightRecord[] {
	const snapshot = browserTranscriptViewportFlightRecorder.snapshot();
	if (hasWindow()) {
		console.info("[transcript-viewport-trace]", snapshot);
	}
	return snapshot;
}

function installBrowserTraceControls(): void {
	if (!hasWindow()) {
		return;
	}

	browserTraceEnabled = readBrowserTraceEnabled();
	window.__ACEPE_TRANSCRIPT_VIEWPORT_TRACE__ = {
		enable() {
			setBrowserTraceEnabled(true);
		},
		disable() {
			setBrowserTraceEnabled(false);
		},
		dump() {
			return dumpBrowserTrace();
		},
		clear() {
			browserTranscriptViewportFlightRecorder.clear();
		},
	};
}

installBrowserTraceControls();

export function recordTranscriptViewportFlight(input: TranscriptViewportFlightRecordInput): void {
	browserTranscriptViewportFlightRecorder.record(input);
}

export function isTranscriptViewportFlightRecordingEnabled(): boolean {
	return browserTraceEnabled;
}

export function snapshotTranscriptViewportFlight(): readonly TranscriptViewportFlightRecord[] {
	return browserTranscriptViewportFlightRecorder.snapshot();
}
