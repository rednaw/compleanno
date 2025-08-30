<script>
  export let show = false;
  export let encouragePortrait = true;
  
  $: icon = encouragePortrait ? '📱↕️' : '📱↔️';
</script>

{#if show}
  <div class="rotate-message">
    <div class="rotate-icon">{icon}</div>
  </div>
{/if}

<style>
  .rotate-message {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--color-background);
  }

  .rotate-icon {
    font-size: 8rem;
    animation: rotate 3s ease-in-out infinite;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }

  @keyframes rotate {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-15deg) scale(1.1); }
    75% { transform: rotate(15deg) scale(1.1); }
  }
</style>
