import manifest from './manifest.json';

const items = manifest.items;

if (!Array.isArray(items) || items.length === 0) {
	throw new Error('gcm26/c manifest.json requires a non-empty items array');
}

for (const it of items) {
	if (
		!it ||
		typeof it.id !== 'string' ||
		typeof it.question !== 'string' ||
		typeof it.answer !== 'string'
	) {
		throw new Error('gcm26/c manifest: each item must have id, question, and answer (strings)');
	}
}

if (import.meta.env.DEV) {
	const ids = items.map((i) => i.id);
	if (new Set(ids).size !== ids.length) {
		console.error('[gcm26/c] manifest items: duplicate id');
	}
}

/** @type {{ id: string; question: string; answer: string }[]} */
export const ITEMS = items;
