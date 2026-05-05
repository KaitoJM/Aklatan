import { createError } from 'h3'
import { getBookBySlug, getContentBySlug, getPageBySlug, listContentPages } from '../../../../../../services/books'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const contentSlug = getRouterParam(event, 'contentSlug')
  const pageSlug = getRouterParam(event, 'pageSlug')

  if (!slug || !contentSlug || !pageSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Book slug, content slug, and page slug are required.'
    })
  }

  const book = await getBookBySlug(slug)

  if (!book) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Book not found.'
    })
  }

  const content = await getContentBySlug(book.id, contentSlug)

  if (!content) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Content not found.'
    })
  }

  const page = await getPageBySlug(content.id, pageSlug)

  if (!page) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found.'
    })
  }

  const pages = await listContentPages(content.id)
  const pageIndex = pages.findIndex((p) => p.slug === pageSlug)

  return {
    book,
    content,
    page,
    pages,
    pageIndex
  }
})
