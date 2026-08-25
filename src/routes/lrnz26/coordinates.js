/** @typedef {{ lat: number; lng: number }} GeoPoint */

/** @type {Readonly<Record<string, GeoPoint>>} */
export const lrnz26LocationById = Object.freeze({
	'van-ostade': { lat: 52.3521135, lng: 4.8906212 },
	darlingstraat: { lat: 52.3209334, lng: 4.9532276 },
	castillejos: { lat: 41.4082239, lng: 2.1762557 },
	termini: { lat: 52.4022761, lng: 4.9316743 }
});

/** @param {string} id */
export function locationByLineId(id) {
	const point = lrnz26LocationById[id];
	if (!point) throw new Error(`unknown lrnz26 location id: ${id}`);
	return point;
}

/** @param {number} lat @param {number} lng @param {number} [decimals] */
export function formatCoords(lat, lng, decimals = 4) {
	return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
}

/** @param {number} lat @param {number} lng */
export function mapsUrl(lat, lng) {
	return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/** @type {Readonly<Record<'a' | 'b' | 'c' | 'd', string>>} */
export const lrnz26HubImage = Object.freeze({
	a: 'van-ostade.webp',
	b: 'darlingstraat.webp',
	c: 'castillejos.webp',
	d: 'termini.webp'
});

export const lrnz26FinalImage = 'kachel-moshpit.jpg';
