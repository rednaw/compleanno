// Shared utilities for lrnz25 puzzles

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
