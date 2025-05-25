<script>
  import { base } from '$app/paths';
</script>

<a href="{base}/" class="back-button">←</a>
<main>
  <slot />
</main>

<style>
  main {
    text-align: center;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--color-background);
    padding: 2rem;
  }

  .back-button {
    position: fixed;
    top: 1em;
    left: 1em;
    font-size: 3em;
    color: var(--color-theme-1);
    text-decoration: none;
    font-weight: bold;
    z-index: 100;
  }
</style> 