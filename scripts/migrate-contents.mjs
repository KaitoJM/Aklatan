import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { MongoClient } from 'mongodb'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const contentsPath = resolve(rootDir, 'app/data/noli_me_tangere_content.json')

await loadEnv(resolve(rootDir, '.env'))

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME || 'aklatan'
const collectionName = process.env.MONGODB_CONTENTS_COLLECTION || 'contents'

if (!uri) {
  console.error('MONGODB_URI is required.')
  console.error('Example:')
  console.error('MONGODB_URI="mongodb+srv://johnmarkmancol_db_user:<db_password>@cluster0.t81ymyr.mongodb.net/?appName=Cluster0" pnpm migrate:contents')
  process.exit(1)
}

const contents = JSON.parse(await readFile(contentsPath, 'utf8'))

if (!Array.isArray(contents)) {
  throw new Error('Expected app/data/noli_me_tangere_content.json to contain an array of contents.')
}

for (const item of contents) {
  validateContent(item)
}

const now = new Date()
const client = new MongoClient(uri)

try {
  await client.connect()

  const collection = client.db(dbName).collection(collectionName)

  await collection.createIndex({ bookId: 1 })
  await collection.createIndex({ bookId: 1, title: 1 }, { unique: true })

  const operations = contents.map((item) => ({
    updateOne: {
      filter: {
        bookId: item.bookId,
        title: item.title
      },
      update: {
        $set: {
          bookId: item.bookId,
          title: item.title,
          content: item.content,
          image: item.image,
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

  console.log(`Migrated ${contents.length} content records into ${dbName}.${collectionName}.`)
  console.log(`Matched: ${result.matchedCount}`)
  console.log(`Modified: ${result.modifiedCount}`)
  console.log(`Inserted: ${result.upsertedCount}`)
} finally {
  await client.close()
}

function validateContent(item) {
  for (const field of ['bookId', 'title', 'content', 'image']) {
    if (typeof item[field] !== 'string' || !item[field].trim()) {
      throw new Error(`Content item is missing required field: ${field}`)
    }
  }
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
