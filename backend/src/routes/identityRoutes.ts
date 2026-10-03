import express from "express"
import { signUp, confirmEmail, signIn, deleteUser } from "../controllers/identityControllers.ts"

const router = express.Router()

router.post("/signup", signUp)
router.post("/signup/verify", confirmEmail)
router.post("/signin", signIn)
router.delete("/deleteUser/:id", deleteUser)


export default router
