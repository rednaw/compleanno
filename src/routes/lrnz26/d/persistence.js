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

/** @param {0 | 1 | 2} level */
export function saveSplitLevel(level) {
	try {
		localStorage.setItem(lrnz26Keys.gameDSplitLevel, String(level));
	} catch {
		// localStorage may be unavailable
	}
}

/** @returns {0 | 1 | 2} */
export function loadSplitLevel() {
	try {
		const raw = localStorage.getItem(lrnz26Keys.gameDSplitLevel);
		if (raw == null) {
			// migrate legacy normal-count (0–4) → split level (0–2)
			const legacy = localStorage.getItem(lrnz26Keys.gameDNormalCount);
			if (legacy != null) {
				const n = Number.parseInt(legacy, 10);
				if (Number.isFinite(n)) return /** @type {0 | 1 | 2} */ (Math.min(2, Math.max(0, n)));
			}
			return 0;
		}
		const n = Number.parseInt(raw, 10);
		if (n === 1 || n === 2) return n;
		return 0;
	} catch {
		return 0;
	}
}
