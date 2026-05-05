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
  bookId: string
  title: string
  content: string
  image: string
}

type StoredBook = WithId<BookRecord & Document>
type StoredContent = WithId<ContentRecord & Document>

const booksCollectionName = 'books'
const contentsCollectionName = 'contents'

export async function listBooks() {
  const db = await getMongoDb()
  const books = await db
    .collection<BookRecord>(booksCollectionName)
    .find({}, { projection: { _id: 0 } })
    .sort({ title: 1 })
    .toArray()

  return books.map(serializeBook)
}

export async function getBookBySlug(slug: string) {
  const db = await getMongoDb()
  const book = await db
    .collection<BookRecord>(booksCollectionName)
    .findOne({ slug }, { projection: { _id: 0 } })

  return book ? serializeBook(book) : null
}

export async function listBookContents(bookId: string) {
  const db = await getMongoDb()
  const contents = await db
    .collection<ContentRecord>(contentsCollectionName)
    .find({ bookId }, { projection: { _id: 0 } })
    .sort({ title: 1 })
    .toArray()

  return contents.map(serializeContent)
}

export async function getBookContentByTitleSlug(bookId: string, titleSlug: string) {
  const contents = await listBookContents(bookId)

  return contents.find((content) => slugify(content.title) === titleSlug) || null
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
    bookId: content.bookId,
    title: content.title,
    content: content.content,
    image: content.image
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
