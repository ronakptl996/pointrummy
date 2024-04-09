import Joi from "joi";

const pickCardResponseValidator = () => {
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
    totalScorePoint: Joi.number().required(),
    msg: Joi.string().allow("").required(),
    pickUpCard: Joi.string().allow("").required(),
  });
};

export default pickCardResponseValidator;
