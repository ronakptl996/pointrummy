import Joi from "joi";

const providedCardsValidator = () => {
  return Joi.object().keys({
    cards: Joi.array()
      .items({
        group: Joi.array(),
        groupType: Joi.string(),
        cardPoints: Joi.number(),
      })
      .required(),
    opendDeck: Joi.array().required(),
    trumpCard: Joi.array().required(),
    closedDeck: Joi.array().required(),
    cardCount: Joi.number().required(),
    tableId: Joi.string().required(),
  });
};

export default providedCardsValidator;
