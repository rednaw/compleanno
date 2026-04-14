/**
 * GCM26 localStorage keys. Every puzzle key must start with `GCM26_STORAGE_PREFIX` so the hub
 * can call `clearPuzzleKeyPrefix` from puzzle-utils without importing per-game modules.
 */

export const GCM26_STORAGE_PREFIX = 'gcm26_';

/** @readonly */
export const gcm26Keys = Object.freeze({
	gameADone: 'gcm26_game_a_done',
	gameBDone: 'gcm26_game_b_done',
	gameCDone: 'gcm26_game_c_done',
	gameDDone: 'gcm26_game_d_done',
	gameCodeDone: 'gcm26_game_code_done',
	gameCodeOrder: 'gcm26_game_code_order',
	gameACommon: 'gcm26_game_a_common',
	gameACode: 'gcm26_game_a_code'
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
