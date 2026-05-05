import { defineStore } from 'pinia'

export type Book = {
  id: string
  slug: string
  title: string
  author: string
  coverImage: string
  summary: string
}

const allAuthorsLabel = 'All authors'

export const useBooksStore = defineStore('books', () => {
  const bookRecords = ref<Book[]>([])
  const searchQuery = ref('')
  const selectedAuthor = ref(allAuthorsLabel)
  const isLoading = ref(false)
  const errorMessage = ref('')

  const authors = computed(() => [
    allAuthorsLabel,
    ...Array.from(new Set(bookRecords.value.map((book) => book.author))).sort()
  ])

  const filteredBooks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return bookRecords.value.filter((book) => {
      const matchesAuthor =
        selectedAuthor.value === allAuthorsLabel || book.author === selectedAuthor.value
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.summary.toLowerCase().includes(query)

      return matchesAuthor && matchesSearch
    })
  })

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setSelectedAuthor(author: string) {
    selectedAuthor.value = author
  }

  function clearFilters() {
    searchQuery.value = ''
    selectedAuthor.value = allAuthorsLabel
  }

  async function fetchBooks() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      bookRecords.value = await $fetch<Book[]>('/api/books')
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Unable to load books.'
    } finally {
      isLoading.value = false
    }
  }

  return {
    books: bookRecords,
    searchQuery,
    selectedAuthor,
    isLoading,
    errorMessage,
    authors,
    filteredBooks,
    fetchBooks,
    setSearchQuery,
    setSelectedAuthor,
    clearFilters
  }
})
