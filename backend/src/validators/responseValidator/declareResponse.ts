import Joi from "joi";

const declareResponseValidator = () => {
  return Joi.object().keys({
    tableId: Joi.string().required(),
    declareUserId: Joi.string().required(),
    declareSI: Joi.number().required(),
    declareTimer: Joi.number().required(),
    siArrayOfdeclaringTimeStart: Joi.any(),
    message: Joi.string().required(),
    tableState: Joi.string().required(),
  });
};

export default declareResponseValidator;
