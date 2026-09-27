/**
 * Build frozen localStorage key maps for a gift trail.
 * Every value is `prefix + suffix`. Use the same `prefix` with
 * `clearPuzzleKeyPrefix` from puzzle-utils for hub reset.
 *
 * @param {string} prefix e.g. `'grt26_'`
 * @param {Record<string, string>} suffixes e.g. `{ gameADone: 'game_a_done' }`
 * @returns {Readonly<Record<string, string>>}
 */
export function makeTrailKeys(prefix, suffixes) {
	/** @type {Record<string, string>} */
	const keys = {};
	for (const [name, suffix] of Object.entries(suffixes)) {
		keys[name] = `${prefix}${suffix}`;
	}
	return Object.freeze(keys);
}
