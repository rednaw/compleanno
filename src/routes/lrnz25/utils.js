/** Re-exports — existing lrnz25 routes import `./utils.js`. New code may use `$lib/puzzle-utils.js` directly. */
export {
	checkOrientation,
	setupOrientationListeners,
	savePuzzleState,
	loadPuzzleState,
	clearPuzzleState,
	clearPuzzleKeys,
	clearPuzzleKeyPrefix
} from '$lib/puzzle-utils.js';
