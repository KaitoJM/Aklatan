<script setup lang="ts">
import type { Book } from '~/types/books.types'
import type { Content } from '~/types/content.types'
import type { Page } from '~/types/page.types'

const route = useRoute()
const bookSlug = computed(() => String(route.params.slug))
const contentSlug = computed(() => String(route.params.contentSlug))

const { data, error } = await useFetch<{
  book: Book
  content: Content
  pages: Page[]
}>(() => `/api/books/${bookSlug.value}/contents/${contentSlug.value}`, {
  key: `content-${bookSlug.value}-${contentSlug.value}`
})

if (data.value?.pages?.length) {
  await navigateTo(
    `/books/${bookSlug.value}/contents/${contentSlug.value}/pages/${data.value.pages[0].slug}`,
    { replace: true }
  )
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink
      v-if="data?.book"
      :to="`/books/${data.book.slug}`"
      class="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950"
    >
      ← Back to book
    </NuxtLink>

    <section
      v-if="error"
      class="rounded border border-red-200 bg-red-50 px-6 py-5"
    >
      <h1 class="text-base font-semibold text-red-950">
        Unable to load chapter
      </h1>
      <p class="mt-2 text-sm text-red-800">
        {{ error.statusMessage || error.message }}
      </p>
    </section>

    <section
      v-else
      class="rounded border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
    >
      <h2 class="text-lg font-semibold text-slate-950">
        No pages yet
      </h2>
      <p class="mt-2 text-sm text-slate-600">
        This chapter does not have any page records.
      </p>
    </section>
  </div>
</template>
