/**
 * Shared answer-normalization for grt26 games.
 * Strips accents, punctuation; case-insensitive.
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
	for (const exp of list) {
		const c = normalizeAnswer(exp);
		if (c && u === c) return true;
	}
	return false;
}
