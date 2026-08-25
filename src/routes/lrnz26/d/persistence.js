import { lrnz26DTrackSolvedKey, lrnz26Keys } from '../storage-keys.js';
import { tracks } from './tracks.js';

const TRACK_IDS = tracks.map((t) => t.id);
const TRACK_IDS_KEY = [...TRACK_IDS].sort().join('\0');

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

/** @param {unknown} value */
function isValidGroups(value) {
	if (!Array.isArray(value) || value.length === 0) return false;
	/** @type {string[]} */
	const flat = [];
	for (const group of value) {
		if (!Array.isArray(group) || group.length === 0) return false;
		if (!group.every((id) => typeof id === 'string' && TRACK_IDS.includes(id))) return false;
		flat.push(...group);
	}
	return flat.length === TRACK_IDS.length && [...flat].sort().join('\0') === TRACK_IDS_KEY;
}

/** @param {string[][]} groups */
export function saveGroups(groups) {
	try {
		localStorage.setItem(lrnz26Keys.gameDGroups, JSON.stringify(groups));
	} catch {
		// localStorage may be unavailable
	}
}

/** @returns {string[][]} */
export function loadGroups() {
	try {
		const raw = localStorage.getItem(lrnz26Keys.gameDGroups);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (isValidGroups(parsed)) return parsed;
		}
	} catch {
		// ignore corrupt JSON
	}
	return [TRACK_IDS.slice()];
}
