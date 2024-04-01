import Logger from "../../logger";
import { turnHistoryCache } from "../../cache";
import { EMPTY } from "../../constants";
import roundHistory from "./roundHistory";
import { IDefaultPlayerGamePlay } from "../../interfaces/playerGamePlay";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import {
  IGameDetails,
  ITurnDetails,
  IUserDetail,
} from "../../interfaces/turnHistory";

const addTurnHistory = async (
  tableId: string,
  currentRound: number,
  tableGamePlay: IDefaultTableGamePlay,
  playerGamePlay: IDefaultPlayerGamePlay
) => {
  try {
    Logger.info(
      tableId,
      `Starting addTurnHistory for tableId : ${tableId} and round : ${currentRound}`
    );
    const currentTime = new Date();

    const turnHistoryData: Array<IGameDetails> | null =
      await turnHistoryCache.getTurnHistory(tableId);

    let userDetailArr = <IUserDetail[]>[];

    tableGamePlay.seats.map((ele) => {
      let userDetailObj = <IUserDetail>{};
      userDetailObj.name = ele.name;
      userDetailObj.name = ele.userId;
      userDetailObj.seatIndex = ele.si;
      userDetailObj.pp = ele.pp;
      userDetailArr.push(userDetailObj);
    });

    // turn History intialisation and modification
    let turnHistory: Array<IGameDetails>;
    if (turnHistoryData) {
      turnHistory = turnHistoryData;
    } else {
      turnHistory = [
        {
          roundNo: currentRound,
          winnerId: [],
          createdOn: currentTime.toString(),
          modifiedOn: currentTime.toString(),
          extra_info: EMPTY,
          userDetails: userDetailArr,
          turnsDetails: [],
        },
      ];
    }

    let currentRoundHistory: IGameDetails = roundHistory.getCurrentRoundHistory(
      turnHistory,
      currentRound
    );

    if (!currentRoundHistory) {
      currentRoundHistory = {
        roundNo: currentRound,
        winnerId: [],
        createdOn: currentTime.toString(),
        modifiedOn: currentTime.toString(),
        extra_info: EMPTY,
        userDetails: userDetailArr,
        turnsDetails: [],
      };
      turnHistory.push(currentRoundHistory);
    }

    const historyObj: ITurnDetails = {
      turnNo: tableGamePlay.turnCount,
      userId: playerGamePlay.userId,
      turnStatus: EMPTY,
      cardState: playerGamePlay.groupingCards,
      cardPoints: playerGamePlay.cardPoints,
      cardPicked: EMPTY,
      cardPickSource: EMPTY,
      cardDiscarded: EMPTY,
      createdOn: new Date().toString(),
    };

    currentRoundHistory.turnsDetails.push(historyObj);

    turnHistory = roundHistory.replaceRoundHistory(
      turnHistory,
      currentRound,
      currentRoundHistory
    );

    await turnHistoryCache.setTurnHistory(tableId, turnHistory);

    Logger.info(
      tableId,
      `Ending addTurnHistory for tableId : ${tableId} and round : ${currentRound}`
    );

    return { success: true, error: null, tableId };
  } catch (error: any) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} and currentRound ${currentRound} function addTurnHistory`
    );
    throw new Error(error);
  }
};

export default addTurnHistory;
