/**
 * Character maze: `#` wall, `.` floor, `S` start, `G` goal (floor cells).
 */
export const MAZE_LINES = [
	'###################',
	'#S................#',
	'#.####.#######.##.#',
	'#....#.....#...#..#',
	'####.#.###.#.##.#.#',
	'#....#.#...#....#.#',
	'#.####.#.#######.#.#',
	'#......#.........#.#',
	'#########.#######.#.#',
	'#.........#.....#.#.#',
	'#.#########.#.#.#.#.#',
	'#...........#.#...#.#',
	'#############.###.#.#',
	'#.............#...#.#',
	'#.###########.#.###.#',
	'#G............#.....#',
	'###################'
];

/** @typedef {{ row: number, col: number }} Cell */

/**
 * @param {readonly string[]} lines
 * @param {number} cellPx
 */
export function parseMaze(lines, cellPx) {
	const rows = lines.length;
	const cols = lines[0].length;
	/** @type {boolean[][]} */
	const wall = [];
	/** @type {Cell | null} */
	let start = null;
	/** @type {Cell | null} */
	let goal = null;

	for (let i = 0; i < rows; i++) {
		wall[i] = [];
		for (let j = 0; j < cols; j++) {
			const c = lines[i][j];
			if (c === 'S') {
				start = { row: i, col: j };
				wall[i][j] = false;
			} else if (c === 'G') {
				goal = { row: i, col: j };
				wall[i][j] = false;
			} else {
				wall[i][j] = c === '#';
			}
		}
	}

	if (!start || !goal) throw new Error('Maze must include S and G');

	const widthPx = cols * cellPx;
	const heightPx = rows * cellPx;

	return { rows, cols, wall, start, goal, cellPx, widthPx, heightPx };
}

/**
 * @param {{ row: number, col: number }} cell
 * @param {number} cellPx
 */
export function cellCenterPx(cell, cellPx) {
	return {
		x: (cell.col + 0.5) * cellPx,
		y: (cell.row + 0.5) * cellPx
	};
}

/**
 * Resolve circle vs axis-aligned wall cells (repeat for corners).
 * @param {number} x
 * @param {number} y
 * @param {number} r
 * @param {number} vx
 * @param {number} vy
 * @param {boolean[][]} wall
 * @param {number} rows
 * @param {number} cols
 * @param {number} cellPx
 * @returns {{ x: number, y: number, vx: number, vy: number }}
 */
export function resolveWallCollisions(x, y, r, vx, vy, wall, rows, cols, cellPx) {
	let bx = x;
	let by = y;
	let bvx = vx;
	let bvy = vy;

	for (let iter = 0; iter < 6; iter++) {
		const minGi = Math.max(0, Math.floor((by - r) / cellPx));
		const maxGi = Math.min(rows - 1, Math.floor((by + r) / cellPx));
		const minGj = Math.max(0, Math.floor((bx - r) / cellPx));
		const maxGj = Math.min(cols - 1, Math.floor((bx + r) / cellPx));

		let hit = false;
		for (let gi = minGi; gi <= maxGi; gi++) {
			for (let gj = minGj; gj <= maxGj; gj++) {
				if (!wall[gi][gj]) continue;
				const rx = gj * cellPx;
				const ry = gi * cellPx;
				const rw = cellPx;
				const rh = cellPx;

				const cx = Math.min(Math.max(bx, rx), rx + rw);
				const cy = Math.min(Math.max(by, ry), ry + rh);
				let dx = bx - cx;
				let dy = by - cy;
				const d2 = dx * dx + dy * dy;
				if (d2 >= r * r - 1e-6) continue;

				hit = true;
				if (d2 < 1e-8) {
					if (Math.abs(bvx) >= Math.abs(bvy)) {
						dx = bvx >= 0 ? 1 : -1;
						dy = 0;
					} else {
						dx = 0;
						dy = bvy >= 0 ? 1 : -1;
					}
				}
				const dist = Math.sqrt(d2) || 0.0001;
				const overlap = r - dist + 0.5;
				const nx = dx / dist;
				const ny = dy / dist;
				bx += nx * overlap;
				by += ny * overlap;

				const vn = bvx * nx + bvy * ny;
				if (vn < 0) {
					bvx -= vn * nx;
					bvy -= vn * ny;
				}
			}
		}
		if (!hit) break;
	}

	return { x: bx, y: by, vx: bvx, vy: bvy };
}

/**
 * @param {boolean[][]} wall
 * @param {number} rows
 * @param {number} cols
 * @param {Cell} start
 * @param {Cell} goal
 */
export function mazeHasPath(wall, rows, cols, start, goal) {
	/** @type {boolean[][]} */
	const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
	const q = [start];
	seen[start.row][start.col] = true;
	const dirs = [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	];
	while (q.length) {
		const cur = q.shift();
		if (!cur) break;
		if (cur.row === goal.row && cur.col === goal.col) return true;
		for (const [dr, dc] of dirs) {
			const nr = cur.row + dr;
			const nc = cur.col + dc;
			if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
			if (wall[nr][nc] || seen[nr][nc]) continue;
			seen[nr][nc] = true;
			q.push({ row: nr, col: nc });
		}
	}
	return false;
}
