/**
 * LRnz26 localStorage keys. Every puzzle key must start with `LRNZ26_STORAGE_PREFIX` so the hub
 * can call `clearPuzzleKeyPrefix` from puzzle-utils without importing per-game modules.
 */

export const LRNZ26_STORAGE_PREFIX = 'lrnz26_';

/** @readonly */
export const lrnz26Keys = Object.freeze({
	gameADone: 'lrnz26_game_a_done',
	gameBDone: 'lrnz26_game_b_done',
	gameBStep1Done: 'lrnz26_game_b_step1_done',
	gameCDone: 'lrnz26_game_c_done',
	gameCFinal: 'lrnz26_game_c_final',
	gameDDone: 'lrnz26_game_d_done',
	codeDone: 'lrnz26_game_code_done'
});

/** @param {number} clipIndex */
export function lrnz26ClipProgressKey(clipIndex) {
	return `lrnz26_c_clip_${clipIndex}`;
}
