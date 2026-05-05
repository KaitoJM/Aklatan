import { createError } from 'h3'
import { getBookBySlug, listBookContents } from '../../services/books'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Book slug is required.'
    })
  }

  const book = await getBookBySlug(slug)

  if (!book) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Book not found.'
    })
  }

  const contents = await listBookContents(book.id)

  return {
    book,
    contents
  }
})
