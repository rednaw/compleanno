<script>
  import { base } from '$app/paths';
  
  export let href = `${base}/lrnz25/`;
  export let className = '';
  export let highZIndex = false;
</script>

<a href={href} class="back-button {className}" class:high-z-index={highZIndex}>←</a>

<style>
  .back-button {
    position: fixed;
    top: 0;
    left: 1rem;
    font-size: 3rem;
    color: var(--color-theme-1);
    text-decoration: none;
    font-weight: bold;
    z-index: 100;
  }
  
  .back-button.high-z-index {
    z-index: 1001;
  }
</style>
