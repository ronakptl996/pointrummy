import Joi from "joi";

const joinTableResponseValidator = () => {
  return Joi.object().keys({
    rejoin: Joi.boolean(),
    userId: Joi.string().required(),
    si: Joi.number().required(),
    name: Joi.string().required().allow(""),
    pp: Joi.string().required().allow(""),
    userState: Joi.string().required(),
  });
};

export default joinTableResponseValidator;
