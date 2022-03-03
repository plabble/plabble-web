<style lang="scss">
  @import '../../assets/scss/custom.scss';

  .sidenav {
    position: absolute;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1000;
    background-color: var(--card-background-color);

    @include respondTo('sm') {
      width: 80%;
      max-width: 80%;
    }

    @include respondTo('md') {
      width: 40%;
      max-width: 40%;
    }

    @include respondTo('lg') {
      width: 30%;
      max-width: 30%;
    }

    @include respondTo('xl') {
      width: 25%;
      max-width: 25%;
    }
  }

  .sidenav-bg {
    //pointer-events: none; //can click through it
    background-color: rgba($color: #000, $alpha: 0.6);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 999;
  }
</style>

<script lang="ts">
  import { fly } from 'svelte/transition';
  import { swipe } from 'svelte-gestures';

  export let open = false;

  // Swipe left to close menu (on touch devices)
  function handleSwipe(event) {
    if (event.detail?.direction === 'left') {
      open = false;
    }
  }
</script>

{#if open}
  <div
    on:click|self="{() => (open = false)}"
    use:swipe="{{ minSwipeDistance: 100, timeframe: 300, touchAction: 'none' }}"
    on:swipe="{handleSwipe}"
    class="sidenav-bg"
  >
    <div
      in:fly="{{ duration: 600, x: -500, opacity: 1 }}"
      out:fly="{{ duration: 600, x: -500, opacity: 1 }}"
      class="sidenav"
    >
      <slot />
    </div>
  </div>
{/if}
