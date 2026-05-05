import { listBooks } from '../../services/books'

export default defineEventHandler(async () => {
  return listBooks()
})
