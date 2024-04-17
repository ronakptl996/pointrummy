import Joi from "joi";

const cardSortsResponseValidator = () => {
  return Joi.object().keys({
    userId: Joi.string().required(),
    tableId: Joi.string().required(),
    cards: Joi.array()
      .items({
        group: Joi.array(),
        groupType: Joi.string(),
        cardPoints: Joi.number(),
      })
      .required(),
    totalScorePoint: Joi.number().required(),
  });
};

export default cardSortsResponseValidator;
