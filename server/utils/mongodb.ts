import { MongoClient } from 'mongodb'

let clientPromise: Promise<MongoClient> | undefined

export async function getMongoClient() {
  const config = useRuntimeConfig()

  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is required to connect to MongoDB.')
  }

  clientPromise ||= new MongoClient(config.mongodbUri).connect()

  return clientPromise
}

export async function getMongoDb() {
  const config = useRuntimeConfig()
  const client = await getMongoClient()

  return client.db(config.mongodbDbName)
}
