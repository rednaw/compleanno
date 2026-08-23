import manifest from './manifest.json';

/** @type {{ id: string; band: string; label?: string; url?: string; start?: string; end?: string }[]} */
export const clips = manifest.clips;

if (!Array.isArray(clips) || clips.length === 0) {
	throw new Error('lrnz26/c manifest.json: require a non-empty "clips" array');
}

for (const clip of clips) {
	if (typeof clip.id !== 'string' || typeof clip.band !== 'string') {
		throw new Error('lrnz26/c manifest.json: each clip needs id and band');
	}
}

export { answerMatches as bandNameMatches } from '../normalize.js';
