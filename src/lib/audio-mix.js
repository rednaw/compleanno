/**
 * Layered audio mix helpers for guess-to-mute song puzzles.
 * Pages own layout; call these for the hidden audio layer.
 */

/**
 * @typedef {object} MixTrack
 * @property {string} id
 * @property {string} src
 */

/**
 * @returns {{
 *   register: (node: HTMLAudioElement, id: string) => { destroy: () => void },
 *   get: (id: string) => HTMLAudioElement | undefined,
 *   all: () => HTMLAudioElement[],
 *   byId: Record<string, HTMLAudioElement | undefined>
 * }}
 */
export function createAudioRegistry() {
	/** @type {Record<string, HTMLAudioElement | undefined>} */
	const byId = {};
	return {
		byId,
		/** @param {HTMLAudioElement} node @param {string} id */
		register(node, id) {
			byId[id] = node;
			return {
				destroy() {
					if (byId[id] === node) delete byId[id];
				}
			};
		},
		/** @param {string} id */
		get(id) {
			return byId[id];
		},
		all() {
			return /** @type {HTMLAudioElement[]} */ (Object.values(byId).filter(Boolean));
		}
	};
}

/**
 * Mute/pause solved layers; unmute the rest.
 * @param {MixTrack[]} tracks
 * @param {Record<string, boolean>} solved
 * @param {Record<string, HTMLAudioElement | undefined>} audioById
 */
export function applySolvedToAudios(tracks, solved, audioById) {
	for (const t of tracks) {
		const a = audioById[t.id];
		if (!a) continue;
		if (solved[t.id]) {
			a.pause();
			a.muted = true;
			a.volume = 0;
		} else {
			a.muted = false;
			a.volume = 1;
		}
	}
}

/**
 * @param {object} opts
 * @param {MixTrack[]} opts.tracks
 * @param {Record<string, boolean>} opts.solved
 * @param {Record<string, boolean>} opts.loadError
 * @param {Record<string, HTMLAudioElement | undefined>} opts.audioById
 * @param {'random' | 'phased'} [opts.seekMode]
 * @param {() => void} [opts.onNeedsTap] called when autoplay is blocked (not a decode error)
 * @param {(id: string) => void} [opts.onLoadError]
 */
export function startAudioMix({
	tracks,
	solved,
	loadError,
	audioById,
	seekMode = 'random',
	onNeedsTap,
	onLoadError
}) {
	const DEFAULT_LOOP_SEC = 20;

	for (let i = 0; i < tracks.length; i++) {
		const t = tracks[i];
		const a = audioById[t.id];
		if (!a || loadError[t.id] || solved[t.id]) continue;

		const seekAndPlay = () => {
			const loopSec =
				Number.isFinite(a.duration) && a.duration > 0.1 ? a.duration : DEFAULT_LOOP_SEC;
			if (seekMode === 'phased') {
				const n = tracks.length;
				const offset = n <= 1 ? 0 : (i / n) * loopSec;
				a.currentTime = Math.min(offset, Math.max(0, loopSec - 0.05));
			} else {
				a.currentTime = Math.random() * Math.max(0, loopSec - 0.05);
			}
			a.muted = false;
			a.volume = 1;
			a.play().catch(() => {
				if (a.error) {
					onLoadError?.(t.id);
				} else {
					onNeedsTap?.();
				}
			});
		};

		if (a.readyState >= 1) seekAndPlay();
		else a.addEventListener('loadedmetadata', seekAndPlay, { once: true });
	}
}

/** @param {Record<string, HTMLAudioElement | undefined>} audioById */
export function stopAllAudio(audioById) {
	for (const a of Object.values(audioById)) {
		if (a) {
			a.pause();
			a.currentTime = 0;
		}
	}
}
