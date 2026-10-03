import Joi from "joi";

const validateBook = (body:{ title: string; content: string; }) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
  });

  return schema.validate(body);
}

export default validateBook;
