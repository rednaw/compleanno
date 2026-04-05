import manifest from './manifest.json';

const { commonQuestion, commonAnswer, finalCode } = manifest;

if (
	typeof commonQuestion !== 'string' ||
	typeof commonAnswer !== 'string' ||
	!finalCode ||
	typeof finalCode.answer !== 'string' ||
	!Array.isArray(finalCode.hintSegments)
) {
	throw new Error(
		'gcm26/a manifest.json: require commonQuestion, commonAnswer, and finalCode { answer, hintSegments }'
	);
}

export const COMMON_QUESTION = commonQuestion;
export const COMMON_ANSWER = commonAnswer;
export const FINAL_CODE_ANSWER = finalCode.answer;
export const FINAL_HINT_SEGMENTS = finalCode.hintSegments;

if (import.meta.env.DEV) {
	if (FINAL_HINT_SEGMENTS.length !== FINAL_CODE_ANSWER.length) {
		console.error(
			`[gcm26/a] manifest finalCode: hintSegments length (${FINAL_HINT_SEGMENTS.length}) must equal answer length (${FINAL_CODE_ANSWER.length})`
		);
	}
}

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
 * Exact match after normalization (case, accents, punctuation). No typo tolerance.
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
	for (const [a, b] of pairs) {
		if (!a || !b) continue;
		if (a === b) return true;
	}
	return false;
}

/** @type {{ id: string; title: string; url?: string }[]} */
export const films = manifest.clips;
