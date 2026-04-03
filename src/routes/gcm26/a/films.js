import manifest from './manifest.json';

/**
 * @param {string} s
 */
export function normalizeFilmTitle(s) {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/[^a-z0-9\s]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Levenshtein edit distance (insert / delete / substitute).
 * @param {string} a
 * @param {string} b
 */
function levenshtein(a, b) {
	if (a === b) return 0;
	if (!a.length) return b.length;
	if (!b.length) return a.length;
	/** @type {number[]} */
	let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
	/** @type {number[]} */
	let cur = new Array(b.length + 1);
	for (let i = 1; i <= a.length; i++) {
		cur[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
		}
		[cur, prev] = [prev, cur];
	}
	return prev[b.length];
}

/** Max typos we allow vs title length (avoids loose matches on very short names). */
function maxAllowedEdits(canonicalNormalizedLength) {
	if (canonicalNormalizedLength <= 2) return 0;
	if (canonicalNormalizedLength <= 5) return 1;
	return 2;
}

/**
 * @param {string} guess
 * @param {string} canonicalTitle
 */
export function filmTitleMatches(guess, canonicalTitle) {
	const u = normalizeFilmTitle(guess);
	const c = normalizeFilmTitle(canonicalTitle);
	if (!u || !c) return false;
	const stripThe = (x) => x.replace(/^the\s+/, '');
	const pairs = [
		[u, c],
		[stripThe(u), stripThe(c)],
		[u, stripThe(c)],
		[stripThe(u), c]
	];
	const maxD = maxAllowedEdits(c.length);
	for (const [a, b] of pairs) {
		if (!a || !b) continue;
		if (a === b) return true;
		if (levenshtein(a, b) <= maxD) return true;
	}
	return false;
}

/** @type {{ id: string; title: string; url?: string }[]} */
export const films = manifest.clips;
