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

/** @param {string} guess @param {string} expected */
export function answerMatches(guess, expected) {
	const u = normalizeAnswer(guess);
	const c = normalizeAnswer(expected);
	if (!u || !c) return false;
	const stripThe = (/** @type {string} */ x) => x.replace(/^the\s+/, '');
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
