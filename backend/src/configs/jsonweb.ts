import 'dotenv/config'
import jwt from "jsonwebtoken"

const generateToken = (user: {email: string}) => {

  const token = jwt.sign({ email: user.email }, process.env.jwt_secret as string, { expiresIn: "1h" })
  return token
}

export default generateToken
