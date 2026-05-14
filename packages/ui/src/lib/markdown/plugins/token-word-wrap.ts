const WORD_SPLIT_PATTERN = /(\s+)/u;
const FENCE_PATTERN = /^\s*(```|~~~)/u;
const INLINE_ATOMIC_DELIMITERS = ["**", "__", "~~", "`", "*", "_"];

function countNonWhitespaceParts(text: string): number {
	return text
		.split(WORD_SPLIT_PATTERN)
		.filter((part) => part.trim().length > 0).length;
}

function findMatchingDelimiter(text: string, delimiter: string, startIndex: number): number {
	const matchIndex = text.indexOf(delimiter, startIndex + delimiter.length);
	if (matchIndex === -1) {
		return -1;
	}
	return matchIndex + delimiter.length - 1;
}

function findMarkdownLinkEnd(text: string, startIndex: number): number {
	const labelEnd = text.indexOf("]", startIndex + 1);
	if (labelEnd === -1 || text[labelEnd + 1] !== "(") {
		return -1;
	}
	const destinationEnd = text.indexOf(")", labelEnd + 2);
	return destinationEnd;
}

function findAtomicInlineEnd(text: string, startIndex: number): number {
	if (text[startIndex] === "[") {
		return findMarkdownLinkEnd(text, startIndex);
	}

	for (const delimiter of INLINE_ATOMIC_DELIMITERS) {
		if (!text.startsWith(delimiter, startIndex)) {
			continue;
		}

		return findMatchingDelimiter(text, delimiter, startIndex);
	}

	return -1;
}

function countInlineWordSlots(text: string): number {
	let wordCount = 0;
	let proseBuffer = "";

	for (let index = 0; index < text.length; index += 1) {
		const atomicEnd = findAtomicInlineEnd(text, index);
		if (atomicEnd !== -1) {
			wordCount += countNonWhitespaceParts(proseBuffer);
			proseBuffer = "";
			wordCount += 1;
			index = atomicEnd;
			continue;
		}

		proseBuffer += text[index] ?? "";
	}

	wordCount += countNonWhitespaceParts(proseBuffer);
	return wordCount;
}

export function countWordsInMarkdown(markdown: string): number {
	let wordCount = 0;
	let proseBuffer = "";
	let insideFence = false;
	let countedCurrentFence = false;

	for (const line of markdown.split("\n")) {
		if (FENCE_PATTERN.test(line)) {
			if (!insideFence) {
				wordCount += countInlineWordSlots(proseBuffer);
				proseBuffer = "";
				wordCount += 1;
				insideFence = true;
				countedCurrentFence = true;
				continue;
			}

			insideFence = false;
			countedCurrentFence = false;
			continue;
		}

		if (insideFence) {
			if (!countedCurrentFence) {
				wordCount += 1;
				countedCurrentFence = true;
			}
			continue;
		}

		proseBuffer += `${line}\n`;
	}

	wordCount += countInlineWordSlots(proseBuffer);
	return wordCount;
}
