<script lang="ts" context="module">
  export enum BubbleType {
    INFO,
    ME,
    YOU,
  }
</script>

<script lang="ts">
  export let type: BubbleType;
</script>

<div
  class="chat-message"
  class:info="{type == BubbleType.INFO}"
  class:me="{type === BubbleType.ME}"
  class:you="{type === BubbleType.YOU}"
>
  <slot />
</div>
