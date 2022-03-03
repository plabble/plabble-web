<!-- icons from https://feathericons.com/ -->
<script lang="ts">
  export let size = 24;
  export let name;
</script>

<svg
  width="{size}"
  height="{size}"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <use href="{'/icons.svg#' + name}"></use>
</svg>
