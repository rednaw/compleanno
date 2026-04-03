import manifest from '$lib/gcm26/manifest.json';

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
 * @param {string} guess
 * @param {string} canonicalTitle
 */
export function filmTitleMatches(guess, canonicalTitle) {
	const u = normalizeFilmTitle(guess);
	const c = normalizeFilmTitle(canonicalTitle);
	if (!u || !c) return false;
	if (u === c) return true;
	const stripThe = (x) => x.replace(/^the\s+/, '');
	return (
		stripThe(u) === stripThe(c) || u === stripThe(c) || stripThe(u) === c
	);
}

/** @type {{ id: string; title: string; url?: string }[]} */
export const films = manifest.clips;
