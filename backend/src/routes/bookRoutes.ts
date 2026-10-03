import express from 'express'
import { createBook, getAllBooks, deleteBook, getBookById } from '../controllers/booksController.ts'
import verifyJWT from '../middlewares/jwt.ts';
import upload  from '../middlewares/multer.ts';


const router = express.Router()

router.use(verifyJWT)

router.post('/create', upload.array('image',5), createBook)
router.get('/', getAllBooks)
router.get('/:id', getBookById)
router.delete('/delete/:id', deleteBook)


export default router
