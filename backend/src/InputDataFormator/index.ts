import Joi from "joi";
import Errors from "../errors";
import signupFormatorValidator from "../requestValidator/signup";
import { ISignUpInput } from "../interfaces/signup";
import {
  ILeaveTableInput,
  IPickCardFromCloseDackInput,
} from "../interfaces/inputOutputDataFormator";
import leaveTableValidator from "../validators/requestValidator/leaveTable";
import pickCardFromCloseDackValidator from "../validators/requestValidator/pickCardFromCloseDack";

const signUpFormator = async (
  signUpData: ISignUpInput
): Promise<ISignUpInput> => {
  try {
    Joi.assert(signUpData, signupFormatorValidator());
    return signUpData;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
};

const leaveTableFormator = async (leaveTableData: ILeaveTableInput) => {
  try {
    Joi.assert(leaveTableData, leaveTableValidator());
    return leaveTableData;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
};

const pickCardFromCloseDackFormator = async (
  pickCard: IPickCardFromCloseDackInput
) => {
  try {
    Joi.assert(pickCard, pickCardFromCloseDackValidator());
    return pickCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
};

export { signUpFormator, leaveTableFormator, pickCardFromCloseDackFormator };
