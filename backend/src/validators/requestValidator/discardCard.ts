import Joi from "joi";

const discardCardValidator = () => {
  return Joi.object().keys({
    userId: Joi.string().required(),
    tableId: Joi.string().required(),
    currentRound: Joi.number().required(),
    cards: Joi.array()
      .items({
        card: Joi.string().required(),
        groupIndex: Joi.number().required(),
      })
      .required(),
  });
};

export default discardCardValidator;
