<script setup lang="ts">
import type { Page } from "~/types/page.types";

const props = defineProps<{
  pages: Page[];
  currentIndex: number;
  urlPrefix: string;
}>();

const percent = computed(() =>
  Math.round(((props.currentIndex + 1) / props.pages.length) * 100),
);
</script>

<template>
  <div class="w-full space-y-2">
    <div class="flex w-full gap-1">
      <NuxtLink
        v-for="(p, i) in pages"
        :key="p.slug"
        :to="`${urlPrefix}/${p.slug}`"
        :title="p.title"
        class="h-1.5 flex-1 rounded-full transition-colors duration-300"
        :class="
          i < currentIndex
            ? 'bg-white/60 hover:bg-white/80'
            : i === currentIndex
              ? 'bg-white'
              : 'bg-white/20 hover:bg-white/40'
        "
      />
    </div>
  </div>
</template>
