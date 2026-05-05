import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { MongoClient } from 'mongodb'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const booksPath = resolve(__dirname, '../app/data/books.json')

await loadEnv(resolve(rootDir, '.env'))

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'aklatan'
const collectionName = process.env.MONGODB_BOOKS_COLLECTION || 'books'

if (!uri) {
  console.error('MONGODB_URI is required.')
  console.error('Example:')
  console.error('MONGODB_URI="mongodb+srv://johnmarkmancol_db_user:<db_password>@cluster0.t81ymyr.mongodb.net/?appName=Cluster0" pnpm migrate:books')
  process.exit(1)
}

const books = JSON.parse(await readFile(booksPath, 'utf8'))

if (!Array.isArray(books)) {
  throw new Error('Expected app/data/books.json to contain an array of books.')
}

const now = new Date()
const client = new MongoClient(uri)

try {
  await client.connect()

  const collection = client.db(dbName).collection(collectionName)

  await collection.createIndex({ slug: 1 }, { unique: true })
  await collection.createIndex({ title: 'text', author: 'text', summary: 'text' })

  const operations = books.map((book) => ({
    updateOne: {
      filter: { slug: book.slug },
      update: {
        $set: {
          ...book,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      upsert: true
    }
  }))

  const result = operations.length
    ? await collection.bulkWrite(operations, { ordered: false })
    : { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 }

  console.log(`Migrated ${books.length} books into ${dbName}.${collectionName}.`)
  console.log(`Matched: ${result.matchedCount}`)
  console.log(`Modified: ${result.modifiedCount}`)
  console.log(`Inserted: ${result.upsertedCount}`)
} finally {
  await client.close()
}

async function loadEnv(envPath) {
  let contents

  try {
    contents = await readFile(envPath, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      return
    }

    throw error
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmedLine.indexOf('=')

    if (separatorIndex === -1) {
      continue
    }

    const key = trimmedLine.slice(0, separatorIndex).trim()
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
    const value = rawValue.replace(/^['"]|['"]$/g, '')

    process.env[key] ||= value
  }
}
