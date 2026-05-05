import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { MongoClient } from 'mongodb'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

await loadEnv(resolve(rootDir, '.env'))

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'aklatan'
const booksCollectionName = process.env.MONGODB_BOOKS_COLLECTION || 'books'
const contentsCollectionName = process.env.MONGODB_CONTENTS_COLLECTION || 'contents'
const pagesCollectionName = process.env.MONGODB_PAGES_COLLECTION || 'pages'

if (!uri) {
  console.error('MONGODB_URI is required.')
  process.exit(1)
}

const client = new MongoClient(uri)

try {
  await client.connect()

  const db = client.db(dbName)

  await dropCollectionIfExists(db, pagesCollectionName)
  await dropCollectionIfExists(db, contentsCollectionName)
  await dropCollectionIfExists(db, booksCollectionName)
} finally {
  await client.close()
}

console.log('\nDropped existing collections. Re-seeding...\n')

await import('./migrate-books.mjs')
await import('./migrate-contents.mjs')
await import('./migrate-pages.mjs')

async function dropCollectionIfExists(db, collectionName) {
  const collections = await db
    .listCollections({ name: collectionName }, { nameOnly: true })
    .toArray()

  if (!collections.length) {
    console.log(`Skipped ${db.databaseName}.${collectionName} — collection does not exist.`)
    return
  }

  await db.collection(collectionName).drop()
  console.log(`Dropped ${db.databaseName}.${collectionName}.`)
}

async function loadEnv(envPath) {
  let contents

  try {
    contents = await readFile(envPath, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) continue
    const separatorIndex = trimmedLine.indexOf('=')
    if (separatorIndex === -1) continue
    const key = trimmedLine.slice(0, separatorIndex).trim()
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim()
    process.env[key] ||= rawValue.replace(/^['"]|['"]$/g, '')
  }
}
