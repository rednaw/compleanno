<script>
	/** @typedef {{ type: 'text', value: string, sub?: string, suffix?: string, tone: 'lilac' | 'white' | 'pepper', top: string, left: string, rotate: number, scale: number, delay: string }} TextDecoration */
	/** @typedef {{ type: 'icon', icon: string, tone: 'lilac' | 'white' | 'pepper', top: string, left: string, rotate: number, scale: number, delay: string }} IconDecoration */
	/** @typedef {TextDecoration | IconDecoration} Decoration */

	/** @type {Decoration[]} */
	const decorations = [
		{ type: 'text', value: 'π', tone: 'lilac', top: '5%', left: '4%', rotate: -24, scale: 1.35, delay: '0s' },
		{ type: 'icon', icon: 'flask', tone: 'white', top: '9%', left: '82%', rotate: 16, scale: 1.05, delay: '0.6s' },
		{ type: 'text', value: '∫', tone: 'white', top: '22%', left: '1%', rotate: 18, scale: 1.15, delay: '1.1s' },
		{ type: 'icon', icon: 'atom', tone: 'lilac', top: '7%', left: '58%', rotate: -10, scale: 0.95, delay: '0.2s' },
		{ type: 'text', value: 'λ', tone: 'pepper', top: '18%', left: '90%', rotate: -14, scale: 1.25, delay: '1.4s' },
		{ type: 'icon', icon: 'laptop', tone: 'lilac', top: '76%', left: '2%', rotate: -8, scale: 1, delay: '0.9s' },
		{ type: 'text', value: '∞', tone: 'white', top: '88%', left: '46%', rotate: 8, scale: 1.2, delay: '0.3s' },
		{ type: 'text', value: 'H', sub: '2', suffix: 'O', tone: 'lilac', top: '80%', left: '84%', rotate: 12, scale: 1, delay: '1.7s' },
		{ type: 'text', value: '{ }', tone: 'white', top: '12%', left: '22%', rotate: -6, scale: 0.95, delay: '1.2s' },
		{ type: 'icon', icon: 'bulb', tone: 'pepper', top: '84%', left: '14%', rotate: -18, scale: 1.05, delay: '0.5s' },
		{ type: 'text', value: '01', tone: 'lilac', top: '34%', left: '92%', rotate: 20, scale: 1.05, delay: '2s' },
		{ type: 'text', value: '∑', tone: 'white', top: '70%', left: '7%', rotate: -16, scale: 1.1, delay: '1.5s' },
		{ type: 'icon', icon: 'magnet', tone: 'lilac', top: '50%', left: '88%', rotate: 22, scale: 0.9, delay: '0.8s' },
		{ type: 'text', value: 'Δ', tone: 'pepper', top: '92%', left: '5%', rotate: -8, scale: 1.15, delay: '1.9s' },
		{ type: 'icon', icon: 'dna', tone: 'white', top: '60%', left: '1%', rotate: 14, scale: 1, delay: '0.1s' },
		{ type: 'text', value: 'ℏ', tone: 'lilac', top: '3%', left: '40%', rotate: 10, scale: 1.2, delay: '1.3s' },
		{ type: 'icon', icon: 'calc', tone: 'white', top: '78%', left: '90%', rotate: -12, scale: 0.92, delay: '1.6s' },
		{ type: 'text', value: '√', tone: 'lilac', top: '54%', left: '4%', rotate: 6, scale: 1.3, delay: '2.2s' },
		{ type: 'icon', icon: 'rocket', tone: 'pepper', top: '28%', left: '94%', rotate: -20, scale: 0.88, delay: '0.7s' },
		{ type: 'text', value: 'θ', tone: 'white', top: '64%', left: '94%', rotate: 15, scale: 1.05, delay: '1.8s' },
		{ type: 'icon', icon: 'code', tone: 'lilac', top: '42%', left: '0%', rotate: -12, scale: 0.95, delay: '1s' }
	];
	
	let opened = $state(false);
	let opening = $state(false);

	function openPresent() {
		if (opened || opening) return;
		opening = true;
		window.setTimeout(() => {
			opened = true;
			opening = false;
		}, 900);
	}
</script>

<svelte:head>
	<title>Gefeliciteerd!</title>
</svelte:head>

<main class:revealed={opened}>
	<div class="playground" class:visible={opened} aria-hidden={!opened}>
		{#each decorations as item, i (i)}
			<div
				class="floaty floaty--{item.tone}"
				style:top={item.top}
				style:left={item.left}
				style:--rotate="{item.rotate}deg"
				style:--scale={item.scale}
				style:--delay={item.delay}
			>
				{#if item.type === 'text'}
					<span
						class="floaty-text"
						class:floaty-text--mono={item.value === '{ }' || item.value === '01'}
						class:floaty-text--formula={Boolean(item.sub)}
					>
						{item.value}{#if item.sub}<sub>{item.sub}</sub>{/if}{item.suffix ?? ''}
					</span>
				{:else if item.icon === 'flask'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<path
							d="M19 7h10v9l9 24a4 4 0 0 1-3.7 5H13.7a4 4 0 0 1-3.7-5l9-24V7z"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linejoin="round"
						/>
						<path d="M17 7h14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
						<circle cx="24" cy="30" r="2.5" fill="currentColor" opacity="0.45" />
					</svg>
				{:else if item.icon === 'atom'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<circle cx="24" cy="24" r="3.5" fill="currentColor" />
						<ellipse cx="24" cy="24" rx="17" ry="6.5" fill="none" stroke="currentColor" stroke-width="2" />
						<ellipse
							cx="24"
							cy="24"
							rx="17"
							ry="6.5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							transform="rotate(60 24 24)"
						/>
						<ellipse
							cx="24"
							cy="24"
							rx="17"
							ry="6.5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							transform="rotate(120 24 24)"
						/>
					</svg>
				{:else if item.icon === 'laptop'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<rect
							x="9"
							y="11"
							width="30"
							height="20"
							rx="2.5"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
						/>
						<path d="M5 35h38" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
						<path d="M18 35v4h12v-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />
					</svg>
				{:else if item.icon === 'bulb'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<path
							d="M24 6a14 14 0 0 0-6 26.2V36h12v-3.8A14 14 0 0 0 24 6z"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linejoin="round"
						/>
						<path d="M18 40h12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
						<path d="M20 43h8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
					</svg>
				{:else if item.icon === 'magnet'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<path
							d="M14 10v16a10 10 0 0 0 20 0V10"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
						<path d="M14 10H8v8h6M34 10h6v8h-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
					</svg>
				{:else if item.icon === 'dna'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<path
							d="M14 8c8 4 12 8 20 12M14 16c8 4 12 8 20 12M14 24c8 4 12 8 20 12M14 32c8 4 12 8 20 12M34 8c-8 4-12 8-20 12M34 16c-8 4-12 8-20 12M34 24c-8 4-12 8-20 12M34 32c-8 4-12 8-20 12"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				{:else if item.icon === 'calc'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<rect
							x="10"
							y="6"
							width="28"
							height="36"
							rx="3"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
						/>
						<rect x="14" y="10" width="20" height="8" rx="1.5" fill="currentColor" opacity="0.25" />
						<circle cx="18" cy="26" r="2" fill="currentColor" />
						<circle cx="24" cy="26" r="2" fill="currentColor" />
						<circle cx="30" cy="26" r="2" fill="currentColor" />
						<circle cx="18" cy="34" r="2" fill="currentColor" />
						<circle cx="24" cy="34" r="2" fill="currentColor" />
						<circle cx="30" cy="34" r="2" fill="currentColor" />
					</svg>
				{:else if item.icon === 'rocket'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<path
							d="M24 6c-2 8-2 16 0 24 6-2 10-6 12-12-2-6-6-10-12-12z"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linejoin="round"
						/>
						<circle cx="24" cy="18" r="3" fill="currentColor" opacity="0.35" />
						<path d="M16 32l-4 8 8-2M32 32l4 8-8-2" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
					</svg>
				{:else if item.icon === 'code'}
					<svg class="floaty-icon" viewBox="0 0 48 48" aria-hidden="true">
						<path
							d="M16 16 8 24l8 8M32 16l8 8-8 8"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M27 8 21 40"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
					</svg>
				{/if}
			</div>
		{/each}
	</div>

	<div class="center-stage">
		<button
			type="button"
			class="present-trigger"
			class:opening
			class:opened
			onclick={openPresent}
			disabled={opened || opening}
			aria-label="Open het cadeau"
			aria-hidden={opened}
		>
			<div class="present" aria-hidden="true">
				<div class="present-lid">
					<div class="ribbon ribbon-h"></div>
					<div class="bow"></div>
				</div>
				<div class="present-base">
					<div class="ribbon ribbon-v"></div>
				</div>
			</div>
			<span class="present-hint">Tik om te openen</span>
		</button>

		<article class="invitation" class:revealed={opened} aria-hidden={!opened}>
			<h1 class="headline">Gefeliciteerd!</h1>
			<p class="message">
				Een dagje naar de Wetenschapsdag Amsterdam Science Park met je familie!
			</p>
			<p class="link-row">
				<a
					class="event-link"
					href="https://wetenschapsdagamsterdamsciencepark.nl/"
					target="_blank"
					rel="noopener noreferrer"
				>
					wetenschapsdagamsterdamsciencepark.nl
				</a>
			</p>
      <p class="event-date">3 oktober 2026</p>
		</article>
	</div>
</main>

<style>
	main {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		width: 100%;
		min-height: 100dvh;
		overflow: hidden;
		box-sizing: border-box;
		padding:
			max(1.5rem, env(safe-area-inset-top))
			max(1.25rem, env(safe-area-inset-right))
			max(1.5rem, env(safe-area-inset-bottom))
			max(1.25rem, env(safe-area-inset-left));
	}

	.playground {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
		opacity: 0;
		transition: opacity 0.6s ease 0.15s;
	}

	.playground.visible {
		opacity: 1;
	}

	.center-stage {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		width: 100%;
		max-width: 22rem;
		margin: 0 auto;
	}

	.present-trigger {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin: 1.25rem auto 0;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition: opacity 0.35s ease, transform 0.35s ease;
	}

	.present-trigger:disabled:not(.opening) {
		cursor: default;
	}

	.present-trigger.opened {
		opacity: 0;
		transform: scale(0.92);
		pointer-events: none;
		position: absolute;
		visibility: hidden;
	}

	.present-hint {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-lilac);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: opacity 0.25s ease;
	}

	.present-trigger.opening .present-hint,
	.present-trigger.opened .present-hint {
		opacity: 0;
	}

	.present {
		position: relative;
		width: clamp(11rem, 62vw, 16rem);
		height: clamp(11rem, 62vw, 16rem);
		perspective: 900px;
		filter: drop-shadow(0 16px 32px rgba(0, 0, 0, 0.28));
	}

	.present-trigger:not(.opening):not(.opened) .present {
		animation: present-wiggle 2.8s ease-in-out infinite;
	}

	.present-base,
	.present-lid {
		position: absolute;
		left: 0;
		width: 100%;
		border-radius: 0.35rem;
		box-sizing: border-box;
	}

	.present-base {
		bottom: 0;
		height: 68%;
		background: linear-gradient(160deg, #ff524a 0%, var(--color-chili-pepper) 100%);
		transition: opacity 0.45s ease 0.35s, transform 0.45s ease 0.35s;
	}

	.present-lid {
		top: 0;
		height: 36%;
		background: linear-gradient(160deg, #ff6b63 0%, #ff453d 100%);
		transform-origin: bottom center;
		transition: transform 0.85s cubic-bezier(0.34, 1.2, 0.64, 1);
		z-index: 2;
	}

	.present-trigger.opening .present-lid,
	.present-trigger.opened .present-lid {
		transform: translateY(-115%) rotate(-28deg);
	}

	.present-trigger.opening .present-base,
	.present-trigger.opened .present-base {
		opacity: 0;
		transform: scale(0.88);
	}

	.ribbon {
		position: absolute;
		background: var(--color-lilac);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
	}

	.ribbon-v {
		top: 0;
		left: 50%;
		width: 18%;
		height: 100%;
		transform: translateX(-50%);
	}

	.ribbon-h {
		top: 50%;
		left: 0;
		width: 100%;
		height: 18%;
		transform: translateY(-50%);
	}

	.bow {
		position: absolute;
		top: 72%;
		left: 50%;
		width: 42%;
		height: 34%;
		transform: translate(-50%, -50%);
	}

	.bow::before,
	.bow::after {
		content: '';
		position: absolute;
		top: 0;
		width: 46%;
		height: 100%;
		border: 0.35rem solid var(--color-white);
		border-radius: 999px 999px 0 999px;
		box-sizing: border-box;
	}

	.bow::before {
		left: 0;
		transform: rotate(-28deg);
	}

	.bow::after {
		right: 0;
		transform: rotate(28deg) scaleX(-1);
	}

	@keyframes present-wiggle {
		0%,
		100% {
			transform: rotate(0deg) scale(1);
		}

		25% {
			transform: rotate(-2deg) scale(1.01);
		}

		75% {
			transform: rotate(2deg) scale(1.01);
		}
	}

	.floaty {
		position: absolute;
		opacity: 0.82;
		transform: rotate(var(--rotate, 0deg)) scale(var(--scale, 1));
		animation: drift 5.5s ease-in-out infinite;
		animation-delay: var(--delay, 0s);
	}

	.floaty-text {
		display: block;
		font-weight: 700;
		line-height: 1;
		user-select: none;
	}

	.floaty-text sub {
		font-size: 0.68em;
		font-weight: 600;
	}

	.floaty-icon {
		display: block;
		width: clamp(2.2rem, 9vw, 3rem);
		height: clamp(2.2rem, 9vw, 3rem);
	}

	.floaty--lilac {
		color: var(--color-lilac);
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
	}

	.floaty--white {
		color: var(--color-white);
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
	}

	.floaty--pepper {
		color: var(--color-chili-pepper);
		filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.35));
	}

	.floaty--lilac .floaty-text,
	.floaty--white .floaty-text,
	.floaty--pepper .floaty-text {
		font-family: 'Times New Roman', Times, serif;
		font-style: italic;
		font-size: clamp(1.75rem, 8vw, 2.6rem);
	}

	.floaty-text--formula {
		font-family: var(--font-body);
		font-style: normal;
		font-size: clamp(1.15rem, 5vw, 1.55rem);
		letter-spacing: 0.02em;
	}

	.floaty-text--mono {
		font-family: var(--font-mono);
		font-style: normal;
		font-size: clamp(1.05rem, 4.8vw, 1.45rem);
		letter-spacing: 0.05em;
	}

	@keyframes drift {
		0%,
		100% {
			transform: rotate(var(--rotate, 0deg)) scale(var(--scale, 1)) translate(0, 0);
		}

		50% {
			transform: rotate(var(--rotate, 0deg)) scale(var(--scale, 1)) translate(0, -7px);
		}
	}

	.invitation {
		width: 100%;
		box-sizing: border-box;
		text-align: left;
		opacity: 0;
		visibility: hidden;
		transform: translateY(1.25rem);
		transition:
			opacity 0.55s ease 0.2s,
			transform 0.55s ease 0.2s,
			visibility 0s linear 0.75s;
	}

	.invitation.revealed {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
		transition:
			opacity 0.55s ease 0.2s,
			transform 0.55s ease 0.2s,
			visibility 0s linear 0s;
	}

	.headline {
		margin: 0 0 0.5rem;
		font-size: clamp(2rem, 9vw, 2.75rem);
		font-weight: 700;
		line-height: 1.12;
		letter-spacing: -0.02em;
		color: var(--color-white);
		text-wrap: balance;
		-webkit-font-smoothing: antialiased;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.event-date {
		margin: 0 0 1rem;
		font-size: 0.8125rem;
		font-weight: 400;
		line-height: 1.3;
		letter-spacing: 0.02em;
		color: var(--color-lilac);
		opacity: 0.85;
		text-wrap: balance;
		-webkit-font-smoothing: antialiased;
	}

	.message {
		margin: 0 0 1.5rem;
		font-size: clamp(1.1rem, 4.8vw, 1.25rem);
		line-height: 1.65;
		color: var(--color-white);
		text-wrap: pretty;
		hyphens: auto;
		-webkit-hyphens: auto;
		-webkit-font-smoothing: antialiased;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.link-row {
		margin: 0;
	}

	.event-link {
		display: inline-flex;
		align-items: center;
		min-height: 2.75rem;
		padding: 0.35rem 0;
		font-size: clamp(0.9rem, 3.6vw, 0.98rem);
		font-weight: 600;
		line-height: 1.4;
		color: var(--color-lilac);
		text-decoration: underline;
		text-underline-offset: 0.18em;
		word-break: break-word;
		-webkit-font-smoothing: antialiased;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}

	.event-link:hover {
		color: var(--color-white);
	}

	@media (prefers-reduced-motion: reduce) {
		.floaty {
			animation: none;
		}

		.present-trigger:not(.opening):not(.opened) .present {
			animation: none;
		}

		.present-lid,
		.present-base,
		.present-trigger,
		.invitation,
		.playground {
			transition: none;
		}
	}
</style>
