import type { Request, Response } from 'express'
import logger from '../configs/logger.ts'
import validateBook from '../configs/validators/bookValidator.ts';
import db from '../lib/index.ts';
import { books } from '../lib/schema.ts';
import { eq } from 'drizzle-orm';
import uploadToCloudinary from '../configs/cloudinaryUpload.ts';
import { UUID } from 'node:crypto';


interface RequestWithUser extends Request {
  user?: {
    id: UUID
  }
}

export const createBook = async (req: RequestWithUser, res: Response) => {
  try {
    logger.info('create book endpoint hit')
    const { error } = validateBook(req.body)

    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { title, content} = req.body

    const [isBookExits] = await db.select().from(books).where(eq(books.title, title) ).limit(1)

    if (isBookExits) {
      return res.status(400).json({ error: 'Book already exists' })
    }

    const files = req.files as Express.Multer.File[] | undefined

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No image provided' })
    }

    const uploaded = await Promise.all(
      files.map((file) => uploadToCloudinary(file.path))
    )

    const imageUrls = uploaded.map((img) => img.url)

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized, Login required' })
    }

    const author = req.user.id
    const keyCache = `all-books`

    const [newBook] = await db.insert(books).values({
      title,
      content,
      image: imageUrls,
      author,
    }).returning()

    await req.redisClient.del(keyCache)

    return res.status(201).json({ message: 'Book created successfully', newBook })

  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    logger.info('get all books endpoint hit')

    const keyCache = `all-books`
    const cachedBooks = await req.redisClient.get(keyCache)

    if (cachedBooks) {
      return res.status(200).json({ cachedData: JSON.parse(cachedBooks) })
    }

    const allBooks = await db.select().from(books)
    await req.redisClient.set(keyCache, JSON.stringify(allBooks), "EX", 3600)

    return res.status(200).json({ data: allBooks })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteBook = async (req: Request, res: Response) => {
  try {
    logger.info('delete book endpoint hit')
    const { id } = req.params
    const keyCache = `all-books`
    const [deletedBook] = await db.delete(books).where(eq(books.id, id as UUID)).returning()

    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found' })
    }

    await req.redisClient.del(keyCache)

    return res.status(200).json({ message: 'Book deleted successfully', deletedBook })

  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const getBookById = async (req: Request, res: Response) => {
  try {
    logger.info('get book by id endpoint hit')
    const { id } = req.params
    const keyCache = `book-${id}`
    const cachedBook = await req.redisClient.get(keyCache)

    if (cachedBook) {
      return res.status(200).json({ cachedData: JSON.parse(cachedBook) })
    }

    const book = await db.select().from(books).where(eq(books.id, id as UUID))

    if (!book) {
      return res.status(404).json({ error: 'Book not found' })
    }

    await req.redisClient.set(keyCache, JSON.stringify(book), "EX", 3600)

    return res.status(200).json({ data: book })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
