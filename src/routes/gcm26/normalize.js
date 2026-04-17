/**
 * Shared answer-normalization for all gcm26 games.
 * Strips accents, punctuation, leading articles; case-insensitive.
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
 * Compare a guess against the canonical answer after normalization.
 * Also tries with/without a leading "the" for flexibility.
 * @param {string} guess
 * @param {string} expected
 */
export function answerMatches(guess, expected) {
	const u = normalizeAnswer(guess);
	const c = normalizeAnswer(expected);
	if (!u || !c) return false;
	const stripThe = (x) => x.replace(/^the\s+/, '');
	const pairs = [
		[u, c],
		[stripThe(u), stripThe(c)],
		[u, stripThe(c)],
		[stripThe(u), c]
	];
	for (const [a, b] of pairs) {
		if (!a || !b) continue;
		if (a === b) return true;
	}
	return false;
}
