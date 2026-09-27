/**
 * Accent/punct-safe answer compare for gift trails.
 * Strips diacritics and punctuation; case-insensitive; optional leading "the".
 */

/** @param {string} s */
export function normalizeAnswer(s) {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.replace(/[^a-z0-9\s]/gu, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * @param {string} guess
 * @param {string | string[]} expected
 */
export function answerMatches(guess, expected) {
	const u = normalizeAnswer(guess);
	if (!u) return false;
	const list = Array.isArray(expected) ? expected : [expected];
	const stripThe = (/** @type {string} */ x) => x.replace(/^the\s+/, '');
	for (const exp of list) {
		const c = normalizeAnswer(exp);
		if (!c) continue;
		const pairs = [
			[u, c],
			[stripThe(u), stripThe(c)],
			[u, stripThe(c)],
			[stripThe(u), c]
		];
		for (const [a, b] of pairs) {
			if (a && b && a === b) return true;
		}
	}
	return false;
}
