import Joi from "joi";

const openDeckCardsResponseValidator = () => {
  return Joi.object().keys({
    userId: Joi.string().required(),
    tableId: Joi.string().required(),
    currentRound: Joi.number().required(),
    openDeckCards: Joi.array().items(Joi.any()),
  });
};

export default openDeckCardsResponseValidator;
