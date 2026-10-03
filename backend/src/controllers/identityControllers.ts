import type { Request, Response } from "express"
import logger from "../configs/logger.ts"
import authSchema from "../configs/validators/authValidate.ts"
import db from "../lib/index.ts"
import { users } from "../lib/schema.ts"
import { eq } from "drizzle-orm"
import verifyEmail from "../helpers/deepEmailValidator.ts"
import argon2 from "argon2"
import crypto from "crypto"
import { sendMail } from "../helpers/mailer.ts"
import generateToken from "../configs/jsonweb.ts"



export const signUp = async (req:Request, res: Response) => {
  try {
    logger.info('SignUp endPoint reached')
    const { error } = authSchema(req.body)
    if (error) {
      return res.status(401).json({
        success: false,
        message: `encountered an error validating your request ${error}`
      })
    }

    const { email, password } = req.body
    const code = crypto.randomInt(0, 100000).toString().padStart(5, "0");

    const [isEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (isEmail) {
      return res.status(401).json({
        success: false,
        message: `user with this email already exits login to continue or register a new account`
      })
    }

    const report = await verifyEmail(email);

    if (!report.valid) {
      return res.status(401).json({
        success: false,
        message: `email validation failed: ${report.reason}`
      })
    }

    const hashedPassword = await argon2.hash(password)

    const newUser = {
      email,
      password: hashedPassword,
      code,
    }

    const keyCache = `signUp:${email}`

    await req.redisClient.set(keyCache, JSON.stringify(newUser), "EX", 600)

    const emailSent = await sendMail({
      to: email,
      subject: "Email Confirmation",
      html: `<p>Your confirmation code is: ${code}</p>`,
      text: `A confirmation code has been sent to your email: ${code}`,
    })

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: `failed to send confirmation email try again later`,
      })
    }

    return res.status(201).json({
      success: true,
      message: `user cached successfully waiting for confirmation`,
      data: { code: newUser.code, email: newUser.email }
    })

 } catch (error) {
   logger.error(error)
   return res.status(500).json({
     success: false,
     message: `encountered an error processing your request`
   })
 }

}

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    logger.info(`confirming email: ${req.body.email}`)

    const { email, code } = req.body
    const keyCache = `signUp:${email}`

    const cachedUser = JSON.parse(await req.redisClient.get(keyCache) as string)
    if(!cachedUser) {
      return res.status(400).json({
        success: false,
        message: `user not found`
      })
    }

    if(cachedUser.code !== code) {
      return res.status(400).json({
        success: false,
        message: `invalid confirmation code`
      })
    }

    await db.insert(users).values({ email: cachedUser.email, password: cachedUser.password })

    await req.redisClient.del(keyCache)

    return res.status(201).json({
      success: true,
      message: `user confirmed successfully`,
      data: email
    })
    }catch (error) {
    logger.error(error)
    return res.status(500).json({
      success: false,
      message: `encountered an error processing your request`
    })
  }
}

export const signIn = async (req: Request, res: Response) => {
  try {
    logger.info(`signing in endpoint hit`)

    const { email, password } = req.body

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if(!user) {
      return res.status(400).json({
        success: false,
        message: `user not found`
      })
    }

    const isPasswordCorrect = await argon2.verify(user.password, password)

    if(!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: `invalid password`
      })
    }

    const token = generateToken(user)

    return res.status(200).json({
      success: true,
      message: `sign in successful`,
      data: user.email,
      token: token,
    })


  } catch (error) {
    logger.error(error)
    return res.status(500).json({
      success: false,
      message: `encountered an error processing your request while signing in`
    })
  }
}


export const deleteUser = async (req: Request, res: Response) => {
  logger.info('deleting user endpoint reached')
  try {
    const { id } = req.params as { id: string }

    const deletedUser = await db.delete(users).where(eq(users.id, id)).returning()

    if(!deletedUser) {
      return res.status(400).json({
        success: false,
        message: `user not found`
      })
    }

    return res.status(200).json({
      success: true,
      message: `user with email ${deletedUser[0].email} deleted successfully`
    })

  } catch (error) {
    logger.error(error)
    return res.status(500).json({
      success: false,
      message: `encountered an error processing your request while deleting user`
    })
  }
}
