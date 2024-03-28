import Joi from "joi";

const setDealerResponseValidator = () => {
  return Joi.object().keys({
    DLR: Joi.number().greater(-1).required(),
    round: Joi.number().greater(-1).required(),
    tableId: Joi.string().required(),
  });
};

export default setDealerResponseValidator;
