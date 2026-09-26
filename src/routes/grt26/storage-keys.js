/**
 * GRT26 localStorage keys. Every puzzle key must start with `GRT26_STORAGE_PREFIX` so the hub
 * can call `clearPuzzleKeyPrefix` from puzzle-utils without importing per-game modules.
 */

export const GRT26_STORAGE_PREFIX = 'grt26_';

/** @readonly */
export const grt26Keys = Object.freeze({
	gameADone: 'grt26_game_a_done',
	gameBDone: 'grt26_game_b_done',
	gameCDone: 'grt26_game_c_done',
	gameDDone: 'grt26_game_d_done',
	codeDone: 'grt26_game_code_done',
	/** Wordle (game A) in-progress serialization */
	wordle: 'grt26_wordle',
	/** Connections (game B) solved groups JSON */
	connectionsSolved: 'grt26_connections_solved'
});

/** @param {string} itemId painting id (game C) */
export function grt26CItemKey(itemId) {
	return `grt26_c_${itemId}`;
}

/** @param {string} trackId manifest track `id` (game D) */
export function grt26DSolvedKey(trackId) {
	return `grt26_d_solved_${trackId}`;
}
