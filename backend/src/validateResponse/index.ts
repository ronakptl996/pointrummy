import Joi from "joi";
import Logger from "../logger";
import {
  INewGTIResponse,
  IScoreBoardRes,
  JTResponse,
} from "../interfaces/tableConfig";
import {
  ICountDown,
  IFormateProvidedCards,
  ISetDealer,
  IStartUserTurnResponse,
  ITossCards,
} from "../interfaces/round";
import gtiResponseValidator from "../validators/responseValidator/gtiResponse";
import joinTableResponseValidator from "../validators/responseValidator/joinTableResponse";
import countDownResponseValidator from "../validators/responseValidator/countDownResponse";
import tossCardResponseValidator from "../validators/responseValidator/tossCardResponse";
import setDealerResponseValidator from "../validators/responseValidator/setDealerResponse";
import providedCardsValidator from "../validators/responseValidator/providedCardsValidator";
import userTurnResponseValidator from "../validators/responseValidator/userTurnResponse";
import {
  ICardSortsRes,
  IDiscardCardRes,
  IGroupCardRes,
  ILeaveTableRes,
  IPickCardFormCloseDackResponse,
  IResuffalDataRes,
} from "../interfaces/inputOutputDataFormator";
import discardCardResponseValidator from "../validators/responseValidator/discardCardsResponse";
import leaveTableResponseValidator from "../validators/responseValidator/leaveTableResponse";
import scoreBoardValidator from "../validators/responseValidator/scoreBoardRes";
import pickCardResponseValidator from "../validators/responseValidator/pickCardResponseValidator";
import reshuffaleResponseValidator from "../validators/responseValidator/reshuffalResponse";
import groupCardResponseValidator from "../validators/responseValidator/groupCardResponse";
import cardSortsResponseValidator from "../validators/responseValidator/cardSortsResponseValidator";

const gtiResponseFormator = async (
  gtiResponse: INewGTIResponse
): Promise<INewGTIResponse> => {
  const tableId = gtiResponse.tableId;
  try {
    Joi.assert(gtiResponse, gtiResponseValidator());
    return gtiResponse;
  } catch (error) {
    Logger.error(tableId, error, "-", gtiResponse);
    throw new Error(`gtiResponseFormator()`);
  }
};

const joinTableResponseFormator = async (joinTableResponse: JTResponse) => {
  const userId = joinTableResponse.userId;
  try {
    Joi.assert(joinTableResponse, joinTableResponseValidator());
    return joinTableResponse;
  } catch (error) {
    Logger.error(userId, error, "-", joinTableResponse);
    throw new Error(`Errot ::: ${error}`);
  }
};

const countDownResponseFormator = async (
  countDownData: ICountDown
): Promise<ICountDown> => {
  const tableId = countDownData.tableId;
  try {
    Joi.assert(countDownData, countDownResponseValidator());
    return countDownData;
  } catch (error) {
    Logger.error(tableId, error, "-", countDownData);
    throw new Error(`countDownResponseFormator() Erorr::${error}`);
  }
};

const tossCardResponseFormator = (tossCardData: ITossCards) => {
  const tableId = tossCardData.tableId;
  try {
    Joi.assert(tossCardData, tossCardResponseValidator());
    return tossCardData;
  } catch (error) {
    Logger.error(tableId, error, "-", tossCardData);
    throw new Error(` tossCardResponseFormator() ===>> ${error}`);
  }
};

const setDealerResponseFormator = async (dealerData: ISetDealer) => {
  const tableId = dealerData.tableId;
  try {
    Joi.assert(dealerData, setDealerResponseValidator());
    return dealerData;
  } catch (error) {
    Logger.error(tableId, error, "-", dealerData);
    Logger.info(tableId, error, "-", dealerData);

    throw new Error(` setDealerResponseFormator() ===>> ${error}`);
  }
};

const providedCardResponseFormator = async (
  cardData: IFormateProvidedCards
) => {
  const tableId = cardData.tableId;
  try {
    Joi.assert(cardData, providedCardsValidator());
    return cardData;
  } catch (error) {
    Logger.error(tableId, error, "-", cardData);
    throw new Error(`providedCardsValidator() ERROR ====>> `);
  }
};

const userTurnResponseFormator = async (
  userTurnData: IStartUserTurnResponse
) => {
  const tableId = userTurnData.tableId;
  try {
    Joi.assert(userTurnData, userTurnResponseValidator());
    return userTurnData;
  } catch (error) {
    Logger.error(tableId, error, "-", userTurnData);
    throw new Error(`userTurnResponseFormator() Error :: ${error}`);
  }
};

const discardCardResponseFormator = async (
  discardCardData: IDiscardCardRes
) => {
  const tableId = discardCardData.tableId;
  try {
    Joi.assert(discardCardData, discardCardResponseValidator());
    return discardCardData;
  } catch (error) {
    Logger.error(tableId, error, "-", discardCardData);
    throw new Error(`discardCardResponseFormator() Error :: ${error}`);
  }
};

const leaveTableFormator = async (leaveData: ILeaveTableRes) => {
  const tableId = leaveData.tableId;
  try {
    Joi.assert(leaveData, leaveTableResponseValidator());
    return leaveData;
  } catch (error) {
    Logger.error(tableId, error, "-", leaveData);
    throw new Error(`leaveTableFormator() ${error}`);
  }
};

const scoreBoardFormator = async (scoreBoardData: IScoreBoardRes) => {
  const tableId = scoreBoardData.tableId;
  try {
    Joi.assert(scoreBoardData, scoreBoardValidator());
    return scoreBoardData;
  } catch (error) {
    Logger.error(tableId, error, "-", scoreBoardData);
    throw new Error(`scoreBoardFormator() ${error}`);
  }
};

const pickCardResponseFormator = async (
  pickCardData: IPickCardFormCloseDackResponse
) => {
  const tableId = pickCardData.tableId;
  try {
    Joi.assert(pickCardData, pickCardResponseValidator());
    return pickCardData;
  } catch (error) {
    Logger.error(tableId, error, "-", pickCardData);
    throw new Error(`pickCardResponseFormator() Error :: ${error}`);
  }
};

const reshuffaleResponseFormator = async (reshuffalData: IResuffalDataRes) => {
  const tableId = reshuffalData.tableId;
  try {
    Joi.assert(reshuffalData, reshuffaleResponseValidator());
    return reshuffalData;
  } catch (error) {
    Logger.error(tableId, error, "-", reshuffalData);
    throw new Error(`resuffalResponseFormator() Error :: ${error}`);
  }
};

const groupCardResponseFormator = async (groupCardData: IGroupCardRes) => {
  const tableId = groupCardData.tableId;
  try {
    Joi.assert(groupCardData, groupCardResponseValidator());
    return groupCardData;
  } catch (error) {
    Logger.error(tableId, error, "-", groupCardData);
    throw new Error(`groupCardResponseFormator() Error :: ${error}`);
  }
};

const cardSortsResponseFormator = async (cardSortsData: ICardSortsRes) => {
  const tableId = cardSortsData.tableId;
  try {
    Joi.assert(cardSortsData, cardSortsResponseValidator());
    return cardSortsData;
  } catch (error) {
    Logger.error(tableId, error, "-", cardSortsData);
    throw new Error(`cardGroupsResponseFormator() Error :: ${error}`);
  }
};

export {
  gtiResponseFormator,
  joinTableResponseFormator,
  countDownResponseFormator,
  tossCardResponseFormator,
  setDealerResponseFormator,
  providedCardResponseFormator,
  userTurnResponseFormator,
  discardCardResponseFormator,
  leaveTableFormator,
  scoreBoardFormator,
  pickCardResponseFormator,
  reshuffaleResponseFormator,
  groupCardResponseFormator,
  cardSortsResponseFormator,
};
