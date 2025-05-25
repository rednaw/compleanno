<script>
  import { base } from '$app/paths';
</script>

<div class="puzzle-container">
  <img src="{base}/C.png?v=2" alt="Puzzle C" class="puzzle-image" />
</div>

<style>
  .puzzle-container {
    background: var(--color-white);
    border-radius: 1em;
    box-shadow: 0 4px 32px rgba(0,0,0,0.1);
    padding: 2em;
    max-width: 800px;
    width: 100%;
  }

  .puzzle-image {
    width: 100%;
    height: auto;
    border-radius: 0.5em;
  }
</style> 