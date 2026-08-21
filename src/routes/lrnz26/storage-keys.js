/**
 * LRnz26 localStorage keys. Every puzzle key must start with `LRNZ26_STORAGE_PREFIX` so the hub
 * can call `clearPuzzleKeyPrefix` from puzzle-utils without importing per-game modules.
 */

export const LRNZ26_STORAGE_PREFIX = 'lrnz26_';

/** @readonly */
export const lrnz26Keys = Object.freeze({
	gameADone: 'lrnz26_game_a_done',
	gameBDone: 'lrnz26_game_b_done',
	gameCDone: 'lrnz26_game_c_done',
	gameDDone: 'lrnz26_game_d_done',
	codeDone: 'lrnz26_game_code_done'
});
