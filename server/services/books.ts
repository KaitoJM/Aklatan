import type { Document, WithId } from 'mongodb'
import { getMongoDb } from '../utils/mongodb'

export type BookRecord = {
  id: string
  slug: string
  title: string
  author: string
  coverImage: string
  summary: string
}

export type ContentRecord = {
  id: string
  bookId: string
  slug: string
  title: string
  coverImage: string
  order: number
}

export type PageRecord = {
  id: string
  contentId: string
  slug: string
  title: string
  body: string
  coverImage: string
  order: number
}

type StoredBook = WithId<BookRecord & Document>
type StoredContent = WithId<ContentRecord & Document>
type StoredPage = WithId<PageRecord & Document>

const booksCollection = 'books'
const contentsCollection = 'contents'
const pagesCollection = 'pages'

export async function listBooks() {
  const db = await getMongoDb()
  const books = await db
    .collection<BookRecord>(booksCollection)
    .find({}, { projection: { _id: 0 } })
    .sort({ title: 1 })
    .toArray()

  return books.map(serializeBook)
}

export async function getBookBySlug(slug: string) {
  const db = await getMongoDb()
  const book = await db
    .collection<BookRecord>(booksCollection)
    .findOne({ slug }, { projection: { _id: 0 } })

  return book ? serializeBook(book) : null
}

export async function listBookContents(bookId: string) {
  const db = await getMongoDb()
  const contents = await db
    .collection<ContentRecord>(contentsCollection)
    .find({ bookId }, { projection: { _id: 0 } })
    .sort({ order: 1, title: 1 })
    .toArray()

  return contents.map(serializeContent)
}

export async function getContentBySlug(bookId: string, slug: string) {
  const db = await getMongoDb()
  const content = await db
    .collection<ContentRecord>(contentsCollection)
    .findOne({ bookId, slug }, { projection: { _id: 0 } })

  return content ? serializeContent(content) : null
}

export async function listContentPages(contentId: string) {
  const db = await getMongoDb()
  const pages = await db
    .collection<PageRecord>(pagesCollection)
    .find({ contentId }, { projection: { _id: 0 } })
    .sort({ order: 1, title: 1 })
    .toArray()

  return pages.map(serializePage)
}

export async function getPageBySlug(contentId: string, slug: string) {
  const db = await getMongoDb()
  const page = await db
    .collection<PageRecord>(pagesCollection)
    .findOne({ contentId, slug }, { projection: { _id: 0 } })

  return page ? serializePage(page) : null
}

function serializeBook(book: BookRecord | StoredBook): BookRecord {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    coverImage: book.coverImage,
    summary: book.summary
  }
}

function serializeContent(content: ContentRecord | StoredContent): ContentRecord {
  return {
    id: content.id,
    bookId: content.bookId,
    slug: content.slug,
    title: content.title,
    coverImage: content.coverImage,
    order: content.order
  }
}

function serializePage(page: PageRecord | StoredPage): PageRecord {
  return {
    id: page.id,
    contentId: page.contentId,
    slug: page.slug,
    title: page.title,
    body: page.body,
    coverImage: page.coverImage,
    order: page.order
  }
}
