import Joi from "joi";

const countDownResponseValidator = () => {
  return Joi.object().keys({
    time: Joi.number().integer().required(),
    tableId: Joi.string().required(),
  });
};

export default countDownResponseValidator;
