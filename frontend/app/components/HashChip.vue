<!--
  Hash chip — mono 13px on --bg-inset, 4px radius, middle-truncated. Click to
  copy with an inline "Copied" swap that reverts after 2s.
-->
<template>
  <span class="inline-flex items-center gap-2">
    <component
      :is="copyable ? 'button' : 'span'"
      :type="copyable ? 'button' : undefined"
      class="font-mono text-[13px] leading-[1.4] bg-elevated text-highlighted rounded-[4px] px-2 py-1"
      :class="copyable && 'cursor-pointer transition-colors duration-[160ms] ease-out hover:bg-accented focus-visible:outline-3 focus-visible:outline-primary/25'"
      :aria-label="copyable ? `Copy ${copy ?? value}` : undefined"
      @click="copyable && onCopy()"
    >
      {{ value }}
    </component>
    <span
      v-if="copied"
      class="text-[13px] text-muted"
    >Copied</span>
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: string
  /** Full value written to the clipboard when the visible one is truncated. */
  copy?: string
  copyable?: boolean
}>(), { copyable: true })

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function onCopy() {
  try {
    await navigator.clipboard.writeText(props.copy ?? props.value)
  } catch {
    return
  }
  copied.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (copied.value = false), 2000)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>
