import { clearPuzzleState } from '$lib/puzzle-utils.js';
import { gcm26FilmProgressKey, gcm26Keys } from '../storage-keys.js';

/**
 * @param {number} index
 * @param {{ status: string; feedback: string; guess: string }} data
 */
export function saveFilmProgress(index, data) {
	try {
		localStorage.setItem(gcm26FilmProgressKey(index), JSON.stringify(data));
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
		const raw = localStorage.getItem(gcm26FilmProgressKey(index));
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/** @param {{ status: string; feedback: string; guess: string }} data */
export function saveCommonProgress(data) {
	try {
		localStorage.setItem(gcm26Keys.gameACommon, JSON.stringify(data));
	} catch {
		// localStorage may be unavailable
	}
}

/** @returns {{ status: string; feedback: string; guess?: string } | null} */
export function loadCommonProgress() {
	try {
		const raw = localStorage.getItem(gcm26Keys.gameACommon);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearCommonProgress() {
	clearPuzzleState(gcm26Keys.gameACommon);
}

/** @param {{ status: string; cells: string[] }} data */
export function saveFinalCodeProgress(data) {
	try {
		localStorage.setItem(gcm26Keys.gameACode, JSON.stringify(data));
	} catch {
		// localStorage may be unavailable
	}
}

/** @returns {{ status: string; cells: string[] } | null} */
export function loadFinalCodeProgress() {
	try {
		const raw = localStorage.getItem(gcm26Keys.gameACode);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function clearFinalCodeProgress() {
	clearPuzzleState(gcm26Keys.gameACode);
}
