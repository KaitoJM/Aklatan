import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { MongoClient } from 'mongodb'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const dataDir = resolve(rootDir, 'app/data')

await loadEnv(resolve(rootDir, '.env'))

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'aklatan'
const booksCollection = process.env.MONGODB_BOOKS_COLLECTION || 'books'
const pagesCollection = process.env.MONGODB_PAGES_COLLECTION || 'pages'

if (!uri) {
  console.error('MONGODB_URI is required.')
  process.exit(1)
}

const contentFiles = (await readdir(dataDir))
  .filter((f) => f.endsWith('_content.json'))
  .map((f) => resolve(dataDir, f))

if (!contentFiles.length) {
  console.log('No *_content.json files found in app/data/. Nothing to migrate.')
  process.exit(0)
}

const client = new MongoClient(uri)

try {
  await client.connect()

  const db = client.db(dbName)
  const books = db.collection(booksCollection)
  const pages = db.collection(pagesCollection)

  await pages.createIndex({ contentId: 1, slug: 1 }, { unique: true, name: 'pages_contentId_slug_unique' })
  await pages.createIndex({ contentId: 1, order: 1 }, { name: 'pages_contentId_order' })

  let totalInserted = 0
  let totalModified = 0
  let totalMatched = 0

  for (const filePath of contentFiles) {
    const raw = JSON.parse(await readFile(filePath, 'utf8'))

    validateContentFile(raw, filePath)

    const book = await books.findOne({ title: raw.title })

    if (!book) {
      console.warn(`  No book found with title "${raw.title}" — skipping ${filePath}`)
      continue
    }

    for (const contentItem of raw.contents) {
      if (!Array.isArray(contentItem.pages) || !contentItem.pages.length) {
        continue
      }

      const now = new Date()
      const contentId = `${book.id}-${contentItem.slug}`

      const operations = contentItem.pages.map((page) => ({
        updateOne: {
          filter: { contentId, slug: page.slug },
          update: {
            $set: {
              contentId,
              slug: page.slug,
              title: page.title,
              body: page.body,
              coverImage: page.coverImage,
              order: page.order,
              updatedAt: now
            },
            $setOnInsert: {
              id: `${contentId}-${page.slug}`,
              createdAt: now
            }
          },
          upsert: true
        }
      }))

      const result = operations.length
        ? await pages.bulkWrite(operations, { ordered: false })
        : { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 }

      console.log(`  "${raw.title}" > "${contentItem.title}": ${contentItem.pages.length} pages — matched ${result.matchedCount}, modified ${result.modifiedCount}, inserted ${result.upsertedCount}`)

      totalMatched += result.matchedCount
      totalModified += result.modifiedCount
      totalInserted += result.upsertedCount
    }
  }

  console.log(`\nPages migration complete.`)
  console.log(`Total matched: ${totalMatched}`)
  console.log(`Total modified: ${totalModified}`)
  console.log(`Total inserted: ${totalInserted}`)
} finally {
  await client.close()
}

function validateContentFile(raw, filePath) {
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`${filePath}: expected an object with "title" and "contents" keys.`)
  }

  if (typeof raw.title !== 'string' || !raw.title.trim()) {
    throw new Error(`${filePath}: missing required "title" string.`)
  }

  if (!Array.isArray(raw.contents)) {
    throw new Error(`${filePath}: "contents" must be an array.`)
  }

  for (const [i, item] of raw.contents.entries()) {
    if (!Array.isArray(item.pages)) continue

    for (const [j, page] of item.pages.entries()) {
      for (const field of ['slug', 'title', 'body', 'coverImage']) {
        if (typeof page[field] !== 'string' || !page[field].trim()) {
          throw new Error(`${filePath}: contents[${i}].pages[${j}] is missing required string field "${field}".`)
        }
      }

      if (typeof page.order !== 'number') {
        throw new Error(`${filePath}: contents[${i}].pages[${j}] is missing required number field "order".`)
      }
    }
  }
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
