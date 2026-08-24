<script>
	import { formatCoords, locationByLineId, mapsUrl } from './coordinates.js';

	/** @type {{ orderedIds: string[] }} */
	let { orderedIds } = $props();
</script>

<div class="code-solved">
	<ol class="code-solved-list">
		{#each orderedIds as id, i (id)}
			{@const point = locationByLineId(id)}
			<li class="code-solved-item">
				<span class="code-solved-index">{i + 1}</span>
				<a
					class="code-solved-link"
					href={mapsUrl(point.lat, point.lng)}
					target="_blank"
					rel="noopener noreferrer"
				>
					{formatCoords(point.lat, point.lng)}
				</a>
			</li>
		{/each}
	</ol>
</div>

<style>
	.code-solved {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 5rem 1rem 1.5rem;
		box-sizing: border-box;
		background: var(--color-background);
	}

	.code-solved-list {
		width: 100%;
		max-width: 420px;
		margin: 0;
		padding: 1.25rem;
		list-style: none;
		border-radius: 0.75rem;
		background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
		border: 2px solid rgba(255, 255, 255, 0.12);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
		box-sizing: border-box;
	}

	.code-solved-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.85rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.code-solved-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.code-solved-item:first-child {
		padding-top: 0;
	}

	.code-solved-index {
		flex-shrink: 0;
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
		color: #dbeafe;
		font-weight: 700;
		font-size: 0.9rem;
	}

	.code-solved-link {
		font-family: ui-monospace, 'Cascadia Code', 'DejaVu Sans Mono', monospace;
		font-size: clamp(1rem, 4.2vw, 1.2rem);
		font-weight: 700;
		line-height: 1.35;
		color: #dbeafe;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.code-solved-link:active {
		color: #93c5fd;
	}
</style>
