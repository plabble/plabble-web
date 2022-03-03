<style lang="scss">
  .message-holder {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5em;
  }
</style>

<script lang="ts">
  export let theme = 'bubble';
</script>

<div class="message-holder" data-theme={theme}>
    <slot />
</div>