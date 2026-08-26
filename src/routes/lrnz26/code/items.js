import manifest from './manifest.json';
import { locationByLineId } from '../coordinates.js';
import { answerMatches } from '../normalize.js';

const { lines, correctOrder, startOrder, heading, note } = manifest;

if (!Array.isArray(lines) || lines.length === 0) {
	throw new Error('lrnz26/code manifest.json: non-empty lines[] required');
}

const ids = lines.map((l) => l.id);
const idSet = new Set(ids);
if (idSet.size !== lines.length) {
	throw new Error('lrnz26/code manifest: duplicate line id');
}

/** @param {string[]} order */
function sortedFingerprint(order) {
	return [...order].sort().join('\0');
}

const idsKey = sortedFingerprint(ids);

if (!Array.isArray(correctOrder) || sortedFingerprint(correctOrder) !== idsKey) {
	throw new Error('lrnz26/code manifest: correctOrder must be a permutation of line ids');
}
if (!Array.isArray(startOrder) || sortedFingerprint(startOrder) !== idsKey) {
	throw new Error('lrnz26/code manifest: startOrder must be a permutation of line ids');
}

for (const l of lines) {
	locationByLineId(l.id);
	if (l.image === undefined) continue;
	if (typeof l.image !== 'string' || !l.image || l.image.includes('/') || l.image.includes('..')) {
		throw new Error('lrnz26/code manifest: image must be a basename only (e.g. castillejos.webp)');
	}
}

/** @type {Readonly<Record<string, { id: string; image?: string }>>} */
export const lineById = Object.freeze(Object.fromEntries(lines.map((l) => [l.id, l])));

export const CODE_HEADING = typeof heading === 'string' ? heading : 'Metti in ordine';

/** @readonly */
export const CODE_CORRECT_ORDER = correctOrder;

/** @readonly */
export const CODE_START_ORDER = startOrder;

const noteAccepted = Array.isArray(note?.accepted)
	? note.accepted.filter((a) => typeof a === 'string' && a.trim())
	: [];
if (noteAccepted.length === 0) {
	throw new Error('lrnz26/code manifest: note.accepted must list the physical note text');
}

export const NOTE_PROMPT =
	typeof note?.prompt === 'string' && note.prompt.trim() ? note.prompt.trim() : '';
if (!NOTE_PROMPT) {
	throw new Error('lrnz26/code manifest: note.prompt is required');
}

/** @param {string} guess */
export function noteMatches(guess) {
	return noteAccepted.some((accepted) => answerMatches(guess, accepted));
}

const presentUrlRaw = typeof note?.presentUrl === 'string' ? note.presentUrl.trim() : '';
try {
	const present = new URL(presentUrlRaw);
	if (present.protocol !== 'https:') {
		throw new Error('not https');
	}
} catch {
	throw new Error('lrnz26/code manifest: note.presentUrl must be an https URL');
}

/** @readonly */
export const PRESENT_URL = presentUrlRaw;

const presentTitle =
	typeof note?.presentTitle === 'string' && note.presentTitle.trim() ? note.presentTitle.trim() : '';
if (!presentTitle) {
	throw new Error('lrnz26/code manifest: note.presentTitle is required');
}

/** @readonly */
export const PRESENT_TITLE = presentTitle;

const correctKey = sortedFingerprint(CODE_CORRECT_ORDER);

/** @param {unknown} value */
export function isValidSavedOrder(value) {
	return (
		Array.isArray(value) &&
		value.length === CODE_CORRECT_ORDER.length &&
		value.every((id) => typeof id === 'string' && id in lineById) &&
		sortedFingerprint(value) === correctKey
	);
}
