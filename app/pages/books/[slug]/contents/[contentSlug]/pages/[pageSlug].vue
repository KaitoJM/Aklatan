<script setup lang="ts">
import type { Book } from "~/types/books.types";
import type { Content } from "~/types/content.types";
import type { Page } from "~/types/page.types";

definePageMeta({ layout: "reader" });

const route = useRoute();
const bookSlug = computed(() => String(route.params.slug));
const contentSlug = computed(() => String(route.params.contentSlug));
const pageSlug = computed(() => String(route.params.pageSlug));

const { data, pending, error, refresh } = await useFetch<{
  book: Book;
  content: Content;
  page: Page;
  pages: Page[];
  pageIndex: number;
}>(
  () =>
    `/api/books/${bookSlug.value}/contents/${contentSlug.value}/pages/${pageSlug.value}`,
  {
    key: `page-${bookSlug.value}-${contentSlug.value}-${pageSlug.value}`,
  },
);

const book = computed(() => data.value?.book);
const content = computed(() => data.value?.content);
const page = computed(() => data.value?.page);
const pages = computed(() => data.value?.pages ?? []);
const pageIndex = computed(() => data.value?.pageIndex ?? 0);

const prevPage = computed(() => pages.value[pageIndex.value - 1] ?? null);
const nextPage = computed(() => pages.value[pageIndex.value + 1] ?? null);

function pageUrl(p: Page) {
  return `/books/${bookSlug.value}/contents/${contentSlug.value}/pages/${p.slug}`;
}
</script>

<template>
  <div class="fixed inset-0 -z-10 overflow-hidden bg-black">
    <Transition name="bg-fade">
      <img
        v-if="page"
        :key="page.coverImage"
        :src="page.coverImage"
        class="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-50"
        aria-hidden="true"
      />
    </Transition>
  </div>

  <div class="space-y-6">
    <NuxtLink
      v-if="book && content"
      :to="`/books/${book.slug}`"
      class="inline-flex text-sm font-medium text-white/70 transition hover:text-white"
    >
      ← Back to book
    </NuxtLink>

    <section
      v-if="error"
      class="rounded border border-red-400/30 bg-red-950/70 px-6 py-5 backdrop-blur-sm"
    >
      <h1 class="text-base font-semibold text-red-200">Unable to load page</h1>
      <p class="mt-2 text-sm text-red-300">
        {{ error.statusMessage || error.message }}
      </p>
      <button
        type="button"
        class="mt-4 h-10 rounded bg-red-800 px-4 text-sm font-medium text-white transition hover:bg-red-700"
        @click="refresh()"
      >
        Retry
      </button>
    </section>

    <section
      v-else-if="pending"
      class="rounded bg-white/10 px-6 py-12 text-center backdrop-blur-sm"
    >
      <h1 class="text-lg font-semibold text-white">Loading</h1>
      <p class="mt-2 text-sm text-white/60">
        Opening page from the library database.
      </p>
    </section>

    <template v-else-if="book && content && page">
      <div class="space-y-1 pb-2">
        <p class="text-xs font-medium uppercase tracking-wide text-white/50">
          {{ book.title }} · {{ content.title }}
        </p>
        <h1
          class="text-2xl font-semibold tracking-tight text-white md:text-3xl"
        >
          {{ page.title }}
        </h1>
        <p class="text-sm text-white/40">
          {{ book.author }} · Page {{ pageIndex + 1 }} of {{ pages.length }}
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-[2fr_2fr]">
        <div class="md:sticky md:top-8 md:self-start">
          <img
            :src="page.coverImage"
            :alt="`${page.title} illustration`"
            class="w-full rounded shadow-2xl ring-1 ring-white/10"
          />
        </div>

        <article class="min-w-0 rounded backdrop-blur-sm">
          <div
            class="prose prose-slate max-w-none text-white/80 text-xl"
            v-html="page.body"
          />
        </article>
      </div>

      <nav class="flex items-center justify-between pt-4">
        <NuxtLink
          v-if="prevPage"
          :to="pageUrl(prevPage)"
          class="inline-flex h-10 items-center gap-2 rounded bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          ← Previous
        </NuxtLink>
        <span v-else />

        <span class="text-sm text-white/40">
          {{ pageIndex + 1 }} / {{ pages.length }}
        </span>

        <NuxtLink
          v-if="nextPage"
          :to="pageUrl(nextPage)"
          class="inline-flex h-10 items-center gap-2 rounded bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          Next →
        </NuxtLink>
        <span v-else />
      </nav>
    </template>
  </div>
</template>

<style scoped>
.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 0.7s ease;
  position: absolute;
  inset: 0;
}
.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}
</style>
