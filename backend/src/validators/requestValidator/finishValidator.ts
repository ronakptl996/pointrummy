import Joi from "joi";

const finishValidator = () => {
  return Joi.object().keys({
    userId: Joi.string().required(),
    tableId: Joi.string().required(),
    currentRound: Joi.number().required(),
    finishCard: Joi.array().items({
      card: Joi.string().required(),
      groupIndex: Joi.number().required(),
    }),
  });
};

export default finishValidator;
