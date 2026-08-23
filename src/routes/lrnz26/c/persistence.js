import { lrnz26ClipProgressKey } from '../storage-keys.js';

/**
 * @param {number} index
 * @param {{ status: string; feedback: string; guess: string; level?: number }} data
 */
export function saveClipProgress(index, data) {
	try {
		localStorage.setItem(lrnz26ClipProgressKey(index), JSON.stringify(data));
	} catch {
		// localStorage may be unavailable
	}
}

/**
 * @param {number} index
 * @returns {{ status: string; feedback: string; guess?: string; level?: number } | null}
 */
export function loadClipProgress(index) {
	try {
		const raw = localStorage.getItem(lrnz26ClipProgressKey(index));
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
