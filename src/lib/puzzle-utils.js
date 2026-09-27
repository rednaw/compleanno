// Shared puzzle helpers (orientation, localStorage, deterministic shuffle) for any section —
// import from here, not from another route group.
//
// Under adapter-static / prerender: never call Math.random() while initializing component
// state that ends up in the DOM (tile order, word lists). Server and client would diverge
// and hydration remaps labels. Use seededRandom / seededShuffle instead.

/**
 * Physical portrait from the device, not the layout viewport (avoids false flips when the
 * on-screen keyboard shrinks window.innerHeight on phones).
 * @returns {boolean | null} null if unknown — fall back to viewport aspect ratio
 */
function isDevicePhysicalPortrait() {
	try {
		const t = screen?.orientation?.type;
		if (t === 'portrait-primary' || t === 'portrait-secondary') return true;
		if (t === 'landscape-primary' || t === 'landscape-secondary') return false;
	} catch {
		// ignore
	}
	const wo = window.orientation;
	if (typeof wo === 'number' && !Number.isNaN(wo)) {
		return wo === 0 || wo === 180;
	}
	return null;
}

/** Prefer physical orientation on coarse-pointer devices (phones/tablets); desktop uses viewport. */
function preferPhysicalOrientation() {
	try {
		return matchMedia('(pointer: coarse)').matches;
	} catch {
		return false;
	}
}

/**
 * Check device orientation
 * @param {boolean} encouragePortrait - true to encourage portrait, false to encourage landscape
 * @returns {boolean} true if device is in the encouraged orientation
 */
export function checkOrientation(encouragePortrait = true) {
	if (preferPhysicalOrientation()) {
		const physical = isDevicePhysicalPortrait();
		if (physical !== null) {
			return encouragePortrait ? physical : !physical;
		}
	}

	const width = window.innerWidth;
	const height = window.innerHeight;
	const isPortrait = height > width;
	return encouragePortrait ? isPortrait : !isPortrait;
}

/**
 * Setup orientation change listeners
 * @param {Function} callback - Function to call when orientation changes
 * @returns {Function} Cleanup function to remove listeners
 */
export function setupOrientationListeners(callback) {
	window.addEventListener('resize', callback);
	window.addEventListener('orientationchange', callback);
	return () => {
		window.removeEventListener('resize', callback);
		window.removeEventListener('orientationchange', callback);
	};
}

/**
 * Save puzzle completion state to localStorage
 * @param {string} key - localStorage key
 * @param {string} value - Value to save
 */
export function savePuzzleState(key, value) {
	try {
		localStorage.setItem(key, value);
	} catch {
		// localStorage may be unavailable (private mode, disabled storage, quota).
	}
}

/**
 * Load puzzle completion state from localStorage
 * @param {string} key - localStorage key
 * @returns {boolean} true if puzzle is completed
 */
export function loadPuzzleState(key) {
	try {
		return localStorage.getItem(key) === '1';
	} catch {
		return false;
	}
}

/**
 * Read a raw puzzle value from localStorage (serialized game state, JSON, …)
 * @param {string} key - localStorage key
 * @returns {string | null} null when absent or storage is unavailable
 */
export function loadPuzzleValue(key) {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

/**
 * Clear puzzle state from localStorage
 * @param {string} key - localStorage key
 */
export function clearPuzzleState(key) {
	try {
		localStorage.removeItem(key);
	} catch {
		// localStorage may be unavailable (private mode, disabled storage, quota).
	}
}

/**
 * Remove several puzzle keys (e.g. reset one game hub).
 * @param {string[]} keys
 */
export function clearPuzzleKeys(keys) {
	for (const key of keys) {
		clearPuzzleState(key);
	}
}

/**
 * Remove every localStorage key starting with `prefix` (e.g. hub reset without importing per-game modules).
 * @param {string} prefix
 */
export function clearPuzzleKeyPrefix(prefix) {
	try {
		const toRemove = [];
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i);
			if (k && k.startsWith(prefix)) toRemove.push(k);
		}
		for (const k of toRemove) {
			clearPuzzleState(k);
		}
	} catch {
		// localStorage may be unavailable.
	}
}

/**
 * Deterministic PRNG (mulberry32-ish). Same seed → same sequence on server and client.
 * @param {number} seed
 * @returns {() => number} in [0, 1)
 */
export function seededRandom(seed) {
	let a = seed | 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * In-place Fisher–Yates with a seeded RNG. Mutates and returns `array`.
 * @template T
 * @param {T[]} array
 * @param {number} seed
 * @returns {T[]}
 */
export function seededShuffle(array, seed) {
	const rand = seededRandom(seed);
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
