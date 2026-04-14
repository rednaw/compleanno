/**
 * Image shown on the GCM26 hub when each game (a–d) is completed.
 * The order must differ from both correctOrder and startOrder in the code puzzle manifest.
 * Each value is the filename inside `static/gcm26/code/`.
 * @type {Readonly<Record<'a' | 'b' | 'c' | 'd', string>>}
 */
export const gcm26HubImage = Object.freeze({
	a: 'medusa.webp',
	b: 'topo.webp',
	c: 'guffo.avif',
	d: 'leone.webp'
});
