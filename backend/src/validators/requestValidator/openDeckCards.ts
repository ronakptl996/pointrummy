import Joi from "joi";

const openDeckCardsValidator = () => {
  return Joi.object().keys({
    userId: Joi.string().required(),
    tableId: Joi.string().required(),
    currentRound: Joi.number().required(),
  });
};

export default openDeckCardsValidator;
