// Shared utilities for lrnz25 puzzles

/**
 * Check device orientation
 * @param {boolean} encouragePortrait - true to encourage portrait, false to encourage landscape
 * @returns {boolean} true if device is in the encouraged orientation
 */
export function checkOrientation(encouragePortrait = true) {
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
  } catch {}
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
 * Clear puzzle state from localStorage
 * @param {string} key - localStorage key
 */
export function clearPuzzleState(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
