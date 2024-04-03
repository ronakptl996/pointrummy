import Joi from "joi";

const discardCardResponseValidator = () => {
  return Joi.object().keys({
    userId: Joi.string().required(),
    si: Joi.number().required(),
    tableId: Joi.string().required(),
    cards: Joi.array()
      .items({
        group: Joi.array(),
        groupType: Joi.string(),
        cardPoints: Joi.number(),
      })
      .required(),
    totalScorePoint: Joi.number(),
    opendDeck: Joi.array(),
  });
};

export default discardCardResponseValidator;
