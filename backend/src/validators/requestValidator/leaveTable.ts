import Joi from "joi";

const leaveTableValidator = () => {
  return Joi.object().keys({
    userId: Joi.string().required(),
    tableId: Joi.string().required(),
    currentRound: Joi.number().required(),
    isLeaveFromScoreBoard: Joi.boolean().required(),
  });
};

export default leaveTableValidator;
