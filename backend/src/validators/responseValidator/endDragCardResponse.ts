import Joi from "joi";

const endDragCardResponseValidator = () => {
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
  });
};

export default endDragCardResponseValidator;
