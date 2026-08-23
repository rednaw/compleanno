import manifest from './manifest.json';
import { answerMatches } from '../normalize.js';

/** @type {{ id: string; band: string; aliases?: string[]; label?: string; url?: string; start?: string; end?: string }[]} */
export const clips = manifest.clips;

if (!Array.isArray(clips) || clips.length === 0) {
	throw new Error('lrnz26/c manifest.json: require a non-empty "clips" array');
}

for (const clip of clips) {
	if (typeof clip.id !== 'string' || typeof clip.band !== 'string') {
		throw new Error('lrnz26/c manifest.json: each clip needs id and band');
	}
}

/** @param {string} guess @param {{ band: string; aliases?: string[] }} clip */
export function bandNameMatchesClip(guess, clip) {
	const candidates = [clip.band, ...(clip.aliases ?? [])];
	return candidates.some((name) => answerMatches(guess, name));
}
