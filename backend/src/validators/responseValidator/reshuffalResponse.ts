import Joi from "joi";

const reshuffaleResponseValidator = () => {
  return Joi.object().keys({
    openDeck: Joi.array().required(),
    closedDeck: Joi.array().required(),
    tableId: Joi.string().required(),
  });
};

export default reshuffaleResponseValidator;
