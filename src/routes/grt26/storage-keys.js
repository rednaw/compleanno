/**
 * GRT26 localStorage keys. Every puzzle key must start with `GRT26_STORAGE_PREFIX` so the hub
 * can call `clearPuzzleKeyPrefix` from puzzle-utils without importing per-game modules.
 */
import { makeTrailKeys } from '$lib/storage-keys.js';

export const GRT26_STORAGE_PREFIX = 'grt26_';

/** @readonly */
export const grt26Keys = makeTrailKeys(GRT26_STORAGE_PREFIX, {
	gameADone: 'game_a_done',
	gameBDone: 'game_b_done',
	gameCDone: 'game_c_done',
	gameDDone: 'game_d_done',
	codeDone: 'game_code_done',
	wordle: 'wordle',
	connectionsSolved: 'connections_solved'
});

/** @param {string} itemId painting id (game C) */
export function grt26CItemKey(itemId) {
	return `grt26_c_${itemId}`;
}

/** @param {string} trackId manifest track `id` (game D) */
export function grt26DSolvedKey(trackId) {
	return `grt26_d_solved_${trackId}`;
}
