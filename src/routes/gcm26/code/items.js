import manifest from './manifest.json';

const { lines, correctOrder, startOrder, heading } = manifest;

if (!Array.isArray(lines) || lines.length === 0) {
	throw new Error('gcm26/code manifest.json: non-empty lines[] required');
}

const ids = lines.map((l) => l.id);
const idSet = new Set(ids);
if (idSet.size !== lines.length) {
	throw new Error('gcm26/code manifest: duplicate line id');
}

/** @param {string[]} order */
function sortedFingerprint(order) {
	return [...order].sort().join('\0');
}

const idsKey = sortedFingerprint(ids);

if (!Array.isArray(correctOrder) || sortedFingerprint(correctOrder) !== idsKey) {
	throw new Error('gcm26/code manifest: correctOrder must be a permutation of line ids');
}
if (!Array.isArray(startOrder) || sortedFingerprint(startOrder) !== idsKey) {
	throw new Error('gcm26/code manifest: startOrder must be a permutation of line ids');
}

for (const l of lines) {
	if (l.image === undefined) continue;
	if (typeof l.image !== 'string' || !l.image || l.image.includes('/') || l.image.includes('..')) {
		throw new Error('gcm26/code manifest: image must be a basename only (e.g. topo.webp)');
	}
}

/** @type {Readonly<Record<string, { id: string; text: string; image?: string }>>} */
export const lineById = Object.freeze(Object.fromEntries(lines.map((l) => [l.id, l])));

export const CODE_HEADING = typeof heading === 'string' ? heading : 'Metti in ordine';

/** @readonly */
export const CODE_CORRECT_ORDER = correctOrder;

/** @readonly */
export const CODE_START_ORDER = startOrder;

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
