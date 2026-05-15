---
title: Transcript viewport flicker finalization
date: 2026-05-14
category: ui-bugs
module: agent-panel
problem_type: ui_bug
component: transcript-viewport
severity: high
root_cause: mixed_identity_and_incomplete_anchor_preservation
resolution_type: code_fix
related_components:
  - transcript-viewport-controller
  - transcript-renderer-adapter
  - graph-materializer
  - agent-tool-edit-diff
tags:
  - agent-panel
  - transcript-viewport
  - scrolling
  - virtualization
  - virtua
  - edit-diffs
---

# Transcript viewport flicker finalization

## Problem

The transcript viewport could jump or flicker when the user was detached from the bottom. The most visible cases were sending a message, tool rows resolving from unresolved to rich rows, and edit diff rows changing height.

The bug looked like a virtualizer problem, but the local causes were inside Acepe:

- tool rows could change virtualized identity when canonical operation data arrived,
- detached mode stored a guessed anchor instead of the visible row the user was actually reading,
- `PreserveAnchor` measured the anchor but did not apply the correction needed to keep it still,
- delayed bottom reveals could still fire after the user had scrolled away,
- edit diff rendering could let an older async render clean a newer render.

## Fix

The transcript now keeps one clean scroll story:

```text
scene rows -> viewport controller -> typed effects -> scheduler -> renderer adapter
```

Important details:

- Transcript-linked tool rows keep the transcript entry id as their display row key. Tool-call id, operation id, and interaction id are metadata.
- Virtua and native fallback adapters capture the first visible row and its pixel offset in the viewport.
- Detached row changes and row resizes preserve that visible anchor by applying a scroll offset correction.
- Following row changes and explicit commands still reveal the tail through typed controller effects.
- Historical-load and session-switch delayed bottom reveals are ignored if the user detaches before the delayed frame fires.
- Edit diff rendering has a generation guard, so a stale async render cannot clean or replace the current diff DOM.
- The old unused scroll helpers were deleted, leaving the transcript viewport controller as the single production scroll authority.

## Tests

Covered behavior:

- transcript tool row display id stays stable when canonical operation id differs,
- question display id stays separate from semantic interaction id,
- unresolved-tool diagnostics do not include full transcript text,
- stale edit diff renders cannot replace newer renders,
- native fallback captures the first visible anchor,
- Virtua captures the first visible anchor when row elements are available,
- detached anchor offset is stored from the captured visible row, not raw scroll offset,
- `PreserveAnchor` applies an offset correction,
- historical delayed bottom reveal is cancelled when the user scrolls away,
- row resize follows tail only while attached and preserves anchor while detached,
- old scroll helper import paths are gone.

Commands run:

```bash
bun test packages/desktop/src/lib/acp/session-state/__tests__/agent-panel-graph-materializer.test.ts
cd packages/desktop && bunx vitest run src/lib/acp/components/agent-panel/logic/__tests__/transcript-viewport-controller.vitest.ts src/lib/acp/components/agent-panel/logic/__tests__/transcript-viewport-scheduler.vitest.ts src/lib/acp/components/agent-panel/logic/__tests__/transcript-renderer-adapter.vitest.ts src/lib/acp/components/agent-panel/components/__tests__/scene-content-viewport.svelte.vitest.ts
cd packages/ui && bunx vitest run --config vitest.config.ts src/components/agent-panel/__tests__/agent-tool-edit-diff.svelte.vitest.ts
cd packages/desktop && bun run check
cd packages/ui && bun run check
cd packages/desktop && bun test
cd packages/ui && bun test
```

## Runtime Proof

Pending. The local shell could not reach `http://localhost:1420`, and no Tauri MCP resource was exposed in this tool context.

Debug tracing is now available for the next live repro. In the app console:

```js
window.__ACEPE_TRANSCRIPT_VIEWPORT_TRACE__.enable()
// reproduce the scroll/flicker
window.__ACEPE_TRANSCRIPT_VIEWPORT_TRACE__.dump()
window.__ACEPE_TRANSCRIPT_VIEWPORT_TRACE__.clear()
```

This sets `localStorage["acepe:debug:transcript-viewport"] = "1"` and records a bounded text-free flight history. Disable it with:

```js
window.__ACEPE_TRANSCRIPT_VIEWPORT_TRACE__.disable()
```

When a live app probe is available, capture these without full message text:

- visible row key before update,
- visible row key after update,
- anchor top offset before update,
- anchor top offset after update,
- raw scroll offset before and after update,
- diff DOM presence and height across several animation frames,
- whether the controller was following or detached,
- whether a typed explicit reveal command won that frame.

The expected result is simple: while detached, the same visible anchor should stay within 0-1 px unless an explicit typed reveal command intentionally moves the viewport.
