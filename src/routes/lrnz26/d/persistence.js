import { lrnz26DTrackSolvedKey, lrnz26Keys } from '../storage-keys.js';

/** @param {string} trackId */
export function saveTrackSolved(trackId) {
	try {
		localStorage.setItem(lrnz26DTrackSolvedKey(trackId), '1');
	} catch {
		// localStorage may be unavailable
	}
}

/** @param {string} trackId */
export function loadTrackSolved(trackId) {
	try {
		return localStorage.getItem(lrnz26DTrackSolvedKey(trackId)) === '1';
	} catch {
		return false;
	}
}

/** @param {number} count */
export function saveNormalCount(count) {
	try {
		localStorage.setItem(lrnz26Keys.gameDNormalCount, String(count));
	} catch {
		// localStorage may be unavailable
	}
}

/** @returns {number} */
export function loadNormalCount() {
	try {
		const raw = localStorage.getItem(lrnz26Keys.gameDNormalCount);
		if (raw == null) return 0;
		const n = Number.parseInt(raw, 10);
		return Number.isFinite(n) && n >= 0 ? n : 0;
	} catch {
		return 0;
	}
}
