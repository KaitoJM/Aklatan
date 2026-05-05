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

type StoredBook = WithId<BookRecord & Document>

const booksCollectionName = 'books'

export async function listBooks() {
  const db = await getMongoDb()
  const books = await db
    .collection<BookRecord>(booksCollectionName)
    .find({}, { projection: { _id: 0 } })
    .sort({ title: 1 })
    .toArray()

  return books.map(serializeBook)
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
