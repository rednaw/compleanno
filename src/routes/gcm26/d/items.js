import manifest from './manifest.json';

const { lines, correctOrder, startOrder, heading } = manifest;

if (!Array.isArray(lines) || lines.length === 0) {
	throw new Error('gcm26/d manifest.json: non-empty lines[] required');
}
if (!Array.isArray(correctOrder) || correctOrder.length !== lines.length) {
	throw new Error('gcm26/d manifest: correctOrder must list every line id once');
}
if (!Array.isArray(startOrder) || startOrder.length !== lines.length) {
	throw new Error('gcm26/d manifest: startOrder must list every line id once');
}

const ids = lines.map((l) => l.id);
const idSet = new Set(ids);
if (idSet.size !== lines.length) {
	throw new Error('gcm26/d manifest: duplicate line id');
}

for (const id of correctOrder) {
	if (!idSet.has(id)) {
		throw new Error(`gcm26/d manifest: correctOrder references unknown id ${id}`);
	}
}
for (const id of startOrder) {
	if (!idSet.has(id)) {
		throw new Error(`gcm26/d manifest: startOrder references unknown id ${id}`);
	}
}

/** @param {string[]} order */
function isPermutation(order) {
	if (order.length !== ids.length) return false;
	const c = new Map();
	for (const id of ids) c.set(id, (c.get(id) ?? 0) + 1);
	for (const id of order) {
		if (!c.has(id)) return false;
		c.set(id, c.get(id) - 1);
	}
	return [...c.values()].every((n) => n === 0);
}

if (!isPermutation(correctOrder) || !isPermutation(startOrder)) {
	throw new Error('gcm26/d manifest: correctOrder and startOrder must be permutations of line ids');
}

/** @type {Readonly<Record<string, { id: string; text: string }>>} */
export const lineById = Object.freeze(Object.fromEntries(lines.map((l) => [l.id, l])));

export const GAME_D_HEADING = typeof heading === 'string' ? heading : 'Metti in ordine';

/** @readonly */
export const GAME_D_LINES = lines;

/** @readonly */
export const GAME_D_CORRECT_ORDER = correctOrder;

/** @readonly */
export const GAME_D_START_ORDER = startOrder;
