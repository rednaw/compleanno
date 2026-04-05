import { clearPuzzleState } from '$lib/puzzle-utils.js';

const KEY_COMMON = 'gcm26_game_a_common';
const KEY_CODE = 'gcm26_game_a_code';

/** @param {number} index */
function filmKey(index) {
	return `gcm26_film_${index}`;
}

/**
 * @param {number} index
 * @param {{ status: string; feedback: string; guess: string }} data
 */
export function saveFilmProgress(index, data) {
	try {
		localStorage.setItem(filmKey(index), JSON.stringify(data));
	} catch {
		// localStorage may be unavailable
	}
}

/**
 * @param {number} index
 * @returns {{ status: string; feedback: string; guess?: string } | null}
 */
export function loadFilmProgress(index) {
	try {
		const raw = localStorage.getItem(filmKey(index));
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/** @param {{ status: string; feedback: string; guess: string }} data */
export function saveCommonProgress(data) {
	try {
		localStorage.setItem(KEY_COMMON, JSON.stringify(data));
	} catch {
		// localStorage may be unavailable
	}
}

/** @returns {{ status: string; feedback: string; guess?: string } | null} */
export function loadCommonProgress() {
	try {
		const raw = localStorage.getItem(KEY_COMMON);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearCommonProgress() {
	clearPuzzleState(KEY_COMMON);
}

/** @param {{ status: string; cells: string[] }} data */
export function saveFinalCodeProgress(data) {
	try {
		localStorage.setItem(KEY_CODE, JSON.stringify(data));
	} catch {
		// localStorage may be unavailable
	}
}

/** @returns {{ status: string; cells: string[] } | null} */
export function loadFinalCodeProgress() {
	try {
		const raw = localStorage.getItem(KEY_CODE);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearFinalCodeProgress() {
	clearPuzzleState(KEY_CODE);
}
