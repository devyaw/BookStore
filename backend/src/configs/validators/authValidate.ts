import Joi from 'joi'

interface SignupBody {
  email: string
  password: string
}


const authSchema = (body: SignupBody) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(255),
  })
  return schema.validate(body)
}

export default authSchema
