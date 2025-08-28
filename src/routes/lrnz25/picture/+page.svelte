<script>
  import { base } from '$app/paths';
</script>

<a href="{base}/lrnz25/" class="back-button">←</a>
<div class="puzzle-container">
  <div class="placeholder">Picture</div>
</div>

<style>
  .back-button { position: fixed; top: 0em; left: 1em; font-size: 3em; color: var(--color-theme-1); text-decoration: none; font-weight: bold; z-index: 100; }
  .puzzle-container { background: var(--color-white); border-radius: 1em; box-shadow: 0 4px 32px rgba(0,0,0,0.1); padding: 2em; max-width: 800px; width: 100%; }
  .placeholder { width: 100%; height: 300px; display: flex; align-items: center; justify-content: center; border: 2px dashed var(--color-border); border-radius: 0.5em; color: var(--color-text); font-size: 2rem; }
</style>

