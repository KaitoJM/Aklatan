<script setup lang="ts">
import type { Book } from "~/types/books.types";
import type { Content } from "~/types/content.types";
import type { Page } from "~/types/page.types";

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
  <div class="space-y-6">
    <NuxtLink
      v-if="book && content"
      :to="`/books/${book.slug}`"
      class="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950"
    >
      ← Back to book
    </NuxtLink>

    <section
      v-if="error"
      class="rounded border border-red-200 bg-red-50 px-6 py-5"
    >
      <h1 class="text-base font-semibold text-red-950">Unable to load page</h1>
      <p class="mt-2 text-sm text-red-800">
        {{ error.statusMessage || error.message }}
      </p>
      <button
        type="button"
        class="mt-4 h-10 rounded bg-red-950 px-4 text-sm font-medium text-white transition hover:bg-red-800"
        @click="refresh()"
      >
        Retry
      </button>
    </section>

    <section
      v-else-if="pending"
      class="rounded border border-slate-200 bg-white px-6 py-12 text-center"
    >
      <h1 class="text-lg font-semibold text-slate-950">Loading</h1>
      <p class="mt-2 text-sm text-slate-600">
        Opening page from the library database.
      </p>
    </section>

    <template v-else-if="book && content && page">
      <div class="space-y-1 border-b border-slate-200 pb-5">
        <p class="text-xs font-medium uppercase tracking-wide text-emerald-700">
          {{ book.title }} · {{ content.title }}
        </p>
        <h1
          class="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl"
        >
          {{ page.title }}
        </h1>
        <p class="text-sm text-slate-400">
          {{ book.author }} · Page {{ pageIndex + 1 }} of {{ pages.length }}
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-[2fr_3fr]">
        <div class="md:sticky md:top-8 md:self-start">
          <img
            :src="page.coverImage"
            :alt="`${page.title} illustration`"
            class="w-full rounded border border-slate-200 object-cover shadow-sm"
          />
        </div>

        <article
          class="min-w-0 rounded border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div class="prose prose-slate max-w-none" v-html="page.body" />
        </article>
      </div>

      <nav
        class="flex items-center justify-between border-t border-slate-200 pt-5"
      >
        <NuxtLink
          v-if="prevPage"
          :to="pageUrl(prevPage)"
          class="inline-flex h-10 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          ← {{ prevPage.title }}
        </NuxtLink>
        <span v-else />

        <span class="text-sm text-slate-400">
          {{ pageIndex + 1 }} / {{ pages.length }}
        </span>

        <NuxtLink
          v-if="nextPage"
          :to="pageUrl(nextPage)"
          class="inline-flex h-10 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          {{ nextPage.title }} →
        </NuxtLink>
        <span v-else />
      </nav>
    </template>
  </div>
</template>
