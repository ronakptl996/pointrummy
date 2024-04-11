import Joi from "joi";

const pickCardFromOpenDeckValidator = () => {
  return Joi.object().keys({
    userId: Joi.string().required(),
    tableId: Joi.string().required(),
    currentRound: Joi.number().required(),
  });
};

export default pickCardFromOpenDeckValidator;
