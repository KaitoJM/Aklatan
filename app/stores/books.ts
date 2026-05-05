import { defineStore } from 'pinia'
import books from '~/data/books.json'

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
  const bookRecords = ref<Book[]>(books as Book[])
  const searchQuery = ref('')
  const selectedAuthor = ref(allAuthorsLabel)

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

  return {
    books: bookRecords,
    searchQuery,
    selectedAuthor,
    authors,
    filteredBooks,
    setSearchQuery,
    setSelectedAuthor,
    clearFilters
  }
})
