<script setup lang="ts">
type Book = {
  id: string
  slug: string
  title: string
  author: string
  coverImage: string
  summary: string
}

type BookContent = {
  bookId: string
  title: string
  content: string
  image: string
}

const route = useRoute()
const bookSlug = computed(() => String(route.params.slug))
const contentSlug = computed(() => String(route.params.contentSlug))

const { data, pending, error, refresh } = await useFetch<{
  book: Book
  content: BookContent
}>(() => `/api/books/${bookSlug.value}/contents/${contentSlug.value}`, {
  key: `content-${bookSlug.value}-${contentSlug.value}`
})

const book = computed(() => data.value?.book)
const content = computed(() => data.value?.content)
</script>

<template>
  <div class="space-y-8">
    <NuxtLink
      v-if="book"
      :to="`/books/${book.slug}`"
      class="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950"
    >
      Back to book
    </NuxtLink>

    <section
      v-if="error"
      class="rounded border border-red-200 bg-red-50 px-6 py-5"
    >
      <h1 class="text-base font-semibold text-red-950">
        Unable to load content
      </h1>
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
      <h1 class="text-lg font-semibold text-slate-950">
        Loading content
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        Opening the selected chapter from the library database.
      </p>
    </section>

    <template v-else-if="book && content">
      <section class="space-y-4 border-b border-slate-200 pb-8">
        <p class="text-sm font-medium uppercase tracking-wide text-emerald-700">
          {{ book.title }}
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          {{ content.title }}
        </h1>
        <p class="text-base text-slate-600">
          {{ book.author }}
        </p>
      </section>

      <img
        :src="content.image"
        :alt="`${content.title} image`"
        class="aspect-[16/7] w-full rounded border border-slate-200 object-cover shadow-sm"
      >

      <article class="rounded border border-slate-200 bg-white p-6 shadow-sm">
        <div
          class="prose prose-slate max-w-none"
          v-html="content.content"
        />
      </article>
    </template>
  </div>
</template>
