/**
 * GCM26 localStorage keys. Every puzzle key must start with `GCM26_STORAGE_PREFIX` so the hub
 * can call `clearPuzzleKeyPrefix` from puzzle-utils without importing per-game modules.
 */
import { makeTrailKeys } from '$lib/storage-keys.js';

export const GCM26_STORAGE_PREFIX = 'gcm26_';

/** @readonly */
export const gcm26Keys = makeTrailKeys(GCM26_STORAGE_PREFIX, {
	gameADone: 'game_a_done',
	gameBDone: 'game_b_done',
	gameCDone: 'game_c_done',
	gameDDone: 'game_d_done',
	codeDone: 'game_code_done',
	codeOrder: 'game_code_order',
	gameACommon: 'game_a_common',
	gameACode: 'game_a_code'
});

/** @param {number} filmIndex */
export function gcm26FilmProgressKey(filmIndex) {
	return `gcm26_film_${filmIndex}`;
}

/** @param {string} trackId manifest track `id` (game B) */
export function gcm26BSolvedKey(trackId) {
	return `gcm26_b_solved_${trackId}`;
}

/** @param {string} itemId manifest item `id` (game C) */
export function gcm26CItemKey(itemId) {
	return `gcm26_c_${itemId}`;
}
