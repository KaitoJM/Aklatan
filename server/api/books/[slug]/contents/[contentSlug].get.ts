import { createError } from 'h3'
import { getBookBySlug, getBookContentByTitleSlug } from '../../../../services/books'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const contentSlug = getRouterParam(event, 'contentSlug')

  if (!slug || !contentSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Book slug and content slug are required.'
    })
  }

  const book = await getBookBySlug(slug)

  if (!book) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Book not found.'
    })
  }

  const content = await getBookContentByTitleSlug(book.id, contentSlug)

  if (!content) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Content not found.'
    })
  }

  return {
    book,
    content
  }
})
