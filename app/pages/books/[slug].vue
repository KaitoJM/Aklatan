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
const slug = computed(() => String(route.params.slug))

function toContentSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const { data, pending, error, refresh } = await useFetch<{
  book: Book
  contents: BookContent[]
}>(() => `/api/books/${slug.value}`, {
  key: `book-${slug.value}`
})

const book = computed(() => data.value?.book)
const contents = computed(() => data.value?.contents || [])
</script>

<template>
  <div class="space-y-8">
    <NuxtLink
      to="/"
      class="inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950"
    >
      Back to catalog
    </NuxtLink>

    <section
      v-if="error"
      class="rounded border border-red-200 bg-red-50 px-6 py-5"
    >
      <h1 class="text-base font-semibold text-red-950">
        Unable to load book
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
        Loading book
      </h1>
      <p class="mt-2 text-sm text-slate-600">
        Fetching the book contents from the library database.
      </p>
    </section>

    <template v-else-if="book">
      <section class="grid gap-6 border-b border-slate-200 pb-8 md:grid-cols-[180px_1fr]">
        <img
          :src="book.coverImage"
          :alt="`${book.title} cover`"
          class="aspect-[4/5] w-full rounded border border-slate-200 object-cover shadow-sm"
        >
        <div class="space-y-3">
          <p class="text-sm font-medium uppercase tracking-wide text-emerald-700">
            {{ book.author }}
          </p>
          <h1 class="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            {{ book.title }}
          </h1>
          <p class="max-w-3xl text-base leading-7 text-slate-600">
            {{ book.summary }}
          </p>
          <p class="text-sm text-slate-500">
            {{ contents.length }} content items
          </p>
        </div>
      </section>

      <section
        v-if="contents.length"
        class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="item in contents"
          :key="`${item.bookId}-${item.title}`"
          class="overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <img
            :src="item.image"
            :alt="`${item.title} image`"
            class="aspect-video w-full object-cover"
          >
          <div class="space-y-3 p-4">
            <h2 class="text-lg font-semibold text-slate-950">
              {{ item.title }}
            </h2>
            <div
              class="line-clamp-3 text-sm leading-6 text-slate-600"
              v-html="item.content"
            />
            <NuxtLink
              :to="`/books/${book.slug}/contents/${toContentSlug(item.title)}`"
              class="inline-flex h-10 items-center rounded bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Read
            </NuxtLink>
          </div>
        </article>
      </section>

      <section
        v-else
        class="rounded border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
      >
        <h2 class="text-lg font-semibold text-slate-950">
          No contents yet
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          This book does not have any HTML content records.
        </p>
      </section>
    </template>
  </div>
</template>
