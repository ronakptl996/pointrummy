import Joi from "joi";
import Errors from "../errors";
import signupFormatorValidator from "../requestValidator/signup";
import { ISignUpInput } from "../interfaces/signup";
import {
  IDiscardCardInput,
  IEndDragCardInput,
  IGroupCardInput,
  ILeaveTableInput,
  IPickCardFormOpenDackInput,
  IPickCardFromCloseDackInput,
  ISaveCardsInSortsInput,
} from "../interfaces/inputOutputDataFormator";
import leaveTableValidator from "../validators/requestValidator/leaveTable";
import pickCardFromCloseDackValidator from "../validators/requestValidator/pickCardFromCloseDack";
import pickCardFromOpenDeckValidator from "../validators/requestValidator/pickCardFromOpenDeck";
import discardCardValidator from "../validators/requestValidator/discardCard";
import groupCardValidator from "../requestValidator/groupCard";
import saveCardsInSortsValidator from "../validators/requestValidator/saveCardsInSort";
import endDragCardValidator from "../validators/requestValidator/endDragCard";

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

const pickCardFromOpenDeckFormator = async (
  pickCard: IPickCardFormOpenDackInput
) => {
  try {
    Joi.assert(pickCard, pickCardFromOpenDeckValidator());
    return pickCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
};

const discardCardDataFormator = async (discardCard: IDiscardCardInput) => {
  try {
    Joi.assert(discardCard, discardCardValidator());
    return discardCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
};

const groupCardFormator = async (groupCard: IGroupCardInput) => {
  try {
    Joi.assert(groupCard, groupCardValidator());
    return groupCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
};

const saveCardsInSortsFormator = (saveCards: ISaveCardsInSortsInput) => {
  try {
    Joi.assert(saveCards, saveCardsInSortsValidator());
    return saveCards;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
};

const endDragCardFormator = async (endDragCard: IEndDragCardInput) => {
  try {
    Joi.assert(endDragCard, endDragCardValidator());
    return endDragCard;
  } catch (error) {
    throw new Errors.InvalidInput(error);
  }
};

export {
  signUpFormator,
  leaveTableFormator,
  pickCardFromCloseDackFormator,
  pickCardFromOpenDeckFormator,
  discardCardDataFormator,
  groupCardFormator,
  saveCardsInSortsFormator,
  endDragCardFormator,
};
