/**
 * LRnz26 localStorage keys. Every puzzle key must start with `LRNZ26_STORAGE_PREFIX` so the hub
 * can call `clearPuzzleKeyPrefix` from puzzle-utils without importing per-game modules.
 */
import { makeTrailKeys } from '$lib/storage-keys.js';

export const LRNZ26_STORAGE_PREFIX = 'lrnz26_';

/** @readonly */
export const lrnz26Keys = makeTrailKeys(LRNZ26_STORAGE_PREFIX, {
	gameADone: 'game_a_done',
	gameBDone: 'game_b_done',
	gameBStep1Done: 'game_b_step1_done',
	gameCDone: 'game_c_done',
	gameCFinal: 'game_c_final',
	gameDDone: 'game_d_done',
	gameDGroups: 'game_d_groups',
	codeDone: 'game_code_done',
	codeOrder: 'game_code_order',
	codeNoteDone: 'game_code_note_done'
});

/** @param {number} clipIndex */
export function lrnz26ClipProgressKey(clipIndex) {
	return `lrnz26_c_clip_${clipIndex}`;
}

/** @param {string} trackId */
export function lrnz26DTrackSolvedKey(trackId) {
	return `lrnz26_d_solved_${trackId}`;
}
