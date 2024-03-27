import Joi from "joi";

const tossCardResponseValidator = () => {
  return Joi.object().keys({
    tableId: Joi.string().required(),
    tossCardArr: Joi.array()
      .items({
        userId: Joi.string().required(),
        si: Joi.number().required(),
        card: Joi.string().required(),
        name: Joi.string().required(),
      })
      .required(),
    tossWinnerData: Joi.object().keys({
      userId: Joi.string().required(),
      si: Joi.number().required(),
      card: Joi.string().required(),
      name: Joi.string().required(),
      msg: Joi.string().required(),
    }),
  });
};

export default tossCardResponseValidator;
