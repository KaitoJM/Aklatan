<script setup lang="ts">
const booksStore = useBooksStore()

const searchQuery = computed({
  get: () => booksStore.searchQuery,
  set: (query) => booksStore.setSearchQuery(query)
})

const selectedAuthor = computed({
  get: () => booksStore.selectedAuthor,
  set: (author) => booksStore.setSelectedAuthor(author)
})

const authors = computed(() => booksStore.authors)
const filteredBooks = computed(() => booksStore.filteredBooks)
const totalBooks = computed(() => booksStore.books.length)
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-5 border-b border-slate-200 pb-6 md:grid-cols-[1fr_auto] md:items-end">
      <div class="max-w-2xl space-y-2">
        <p class="text-sm font-medium uppercase tracking-wide text-emerald-700">
          HTML book library
        </p>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          Browse the catalog
        </h1>
        <p class="text-base leading-7 text-slate-600">
          Find static HTML books by title, author, or summary before opening them in the reader.
        </p>
      </div>

      <div class="rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <span class="font-semibold text-slate-950">{{ filteredBooks.length }}</span>
        of
        <span class="font-semibold text-slate-950">{{ totalBooks }}</span>
        books
      </div>
    </section>

    <section class="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-700">Search</span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search title, author, or summary"
          class="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-medium text-slate-700">Author</span>
        <select
          v-model="selectedAuthor"
          class="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option
            v-for="author in authors"
            :key="author"
            :value="author"
          >
            {{ author }}
          </option>
        </select>
      </label>

      <button
        type="button"
        class="mt-7 h-11 rounded border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        @click="booksStore.clearFilters()"
      >
        Clear
      </button>
    </section>

    <section
      v-if="filteredBooks.length"
      class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="book in filteredBooks"
        :key="book.id"
        class="overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <img
          :src="book.coverImage"
          :alt="`${book.title} cover`"
          class="aspect-[4/5] w-full object-cover"
        >
        <div class="space-y-3 p-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-950">
              {{ book.title }}
            </h2>
            <p class="text-sm text-emerald-700">
              {{ book.author }}
            </p>
          </div>

          <p class="line-clamp-3 text-sm leading-6 text-slate-600">
            {{ book.summary }}
          </p>

          <NuxtLink
            :to="`/books/${book.slug}`"
            class="inline-flex h-10 items-center rounded bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Open book
          </NuxtLink>
        </div>
      </article>
    </section>

    <section
      v-else
      class="rounded border border-dashed border-slate-300 bg-white px-6 py-12 text-center"
    >
      <h2 class="text-lg font-semibold text-slate-950">
        No books found
      </h2>
      <p class="mt-2 text-sm text-slate-600">
        Try another search term or choose a different author.
      </p>
      <button
        type="button"
        class="mt-5 h-10 rounded bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
        @click="booksStore.clearFilters()"
      >
        Reset filters
      </button>
    </section>
  </div>
</template>
