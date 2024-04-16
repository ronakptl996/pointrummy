import Joi from "joi";

const groupCardResponseValidator = () => {
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
    totalScorePoint: Joi.number(),
    msg: Joi.string().allow("").required(),
  });
};

export default groupCardResponseValidator;
