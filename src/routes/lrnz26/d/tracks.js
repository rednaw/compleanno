import manifest from './manifest.json';
import { answerMatches } from '../normalize.js';

/** @type {{ id: string; title: string; band?: string; aliases?: string[]; url?: string; start?: string; end?: string }[]} */
export const tracks = manifest.tracks;

if (!Array.isArray(tracks) || tracks.length !== 4) {
	throw new Error('lrnz26/d manifest.json: require exactly 4 tracks (chicken-out splits 4 → 2 → 1)');
}

for (const track of tracks) {
	if (typeof track.id !== 'string' || typeof track.title !== 'string') {
		throw new Error('lrnz26/d manifest.json: each track needs id and title');
	}
}

/** @param {string} guess @param {{ title: string; band?: string; aliases?: string[] }} track */
export function guessMatchesTrack(guess, track) {
	const candidates = [track.title, ...(track.band ? [track.band] : []), ...(track.aliases ?? [])];
	return candidates.some((name) => answerMatches(guess, name));
}

/** @param {{ title: string; band?: string }} track */
export function trackDisplayTitle(track) {
	return track.band ? `${track.title} — ${track.band}` : track.title;
}
