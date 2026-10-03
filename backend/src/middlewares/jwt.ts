import 'dotenv/config'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

interface RequestWithUser extends Request {
  user?: {
    id: string
  }
}

const verifyJWT = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401).json({ message: 'Login required' })

  const decoded = jwt.verify(token, String(process.env.jwt_secret)) as JwtPayload
  req.user = { id: decoded.id }
  next()
}

export default verifyJWT
