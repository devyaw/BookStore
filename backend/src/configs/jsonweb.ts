import 'dotenv/config'
import jwt from "jsonwebtoken"

const generateToken = (user: { id: string, email: string }) => {

  const token = jwt.sign({
    id: user.id,
    email: user.email
  }, process.env.jwt_secret as string, { expiresIn: "1h" })
  return token
}

export default generateToken
