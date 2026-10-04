/**
 * Digit each game hands out. The hub shows them on solved tiles and the code page lists all four —
 * read in the order the recipient knows, they spell `3795`.
 * Puzzle win overlays use the matching photo under `static/grt26/code/`.
 */

/** @readonly */
export const grt26Prizes = Object.freeze({
	a: 'Sofia = 5',
	b: 'Nicolò = 9',
	c: 'Lorenzo = 3',
	d: 'Giacomo = 7'
});

/** Filename under `/grt26/code/` for each game’s fullscreen win image. */
/** @readonly */
export const grt26PrizeImages = Object.freeze({
	a: 'sofia.jpg',
	b: 'nicolo.png',
	c: 'lorenzo.png',
	d: 'giacomo.png'
});
