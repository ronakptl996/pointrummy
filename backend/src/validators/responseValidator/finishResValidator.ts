import Joi from "joi";

const finishResponseValidator = () => {
  return Joi.object().keys({
    currentTurnUserId: Joi.string().required(),
    currentTurnSI: Joi.number().required(),
    turnTimer: Joi.number().required(),
    cards: Joi.array()
      .items({
        group: Joi.array(),
        groupType: Joi.string(),
        cardPoints: Joi.number(),
      })
      .required(),
    totalScorePoint: Joi.number(),
    finishDeck: Joi.array().items(Joi.any()),
    tableId: Joi.string().required(),
  });
};

export default finishResponseValidator;
