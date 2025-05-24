<script>
  import { base } from '$app/paths';
  import '../app.css';
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
</svelte:head>

<style>
  :global(*) {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
</style>

<slot /> 