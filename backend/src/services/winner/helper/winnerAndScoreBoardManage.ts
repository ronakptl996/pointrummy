import Logger from "../../../logger";
import Errors from "../../../errors";
import { IDefaultTableGamePlay } from "../../../interfaces/tableGamePlay";
import {
  IDefaultTableConfig,
  IUserResData,
} from "../../../interfaces/tableConfig";
import { EMPTY, NUMERICAL, PLAYER_STATE } from "../../../constants";
import { playerGamePlayCache } from "../../../cache";
import { IDefaultPlayerGamePlay } from "../../../interfaces/playerGamePlay";
import { autoDiscard } from "../../turn/helper";
import manageAndUpdateData from "../../../utils/manageCardData";
import { IManageAndUpdateData } from "../../../interfaces/round";
import { IUserObj } from "../../../interfaces/winner";

const winnerAndScoreBoardManage = async (
  userId: string,
  tableId: string,
  tableGamePlay: IDefaultTableGamePlay,
  tableConfig: IDefaultTableConfig,
  status: string
) => {
  try {
    let winnerUserId: string = EMPTY;
    let winnerSI: number = NUMERICAL.MINUS_ONE;
    let allUserPGP: IUserResData[] = [];
    let winnerAmount: number = NUMERICAL.ZERO;

    Logger.info("tableConfig.entryFee   ::==>> ", tableConfig.entryFee);

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const userData = tableGamePlay.seats[i];
      const userPGP = (await playerGamePlayCache.getPlayerGamePlay(
        userData.userId,
        tableId
      )) as IDefaultPlayerGamePlay;

      const currentCards: string[] = [];
      userPGP.currentCards.map((ele) => {
        ele.map((e: string) => {
          currentCards.push(e);
        });
      });

      if (currentCards.length === NUMERICAL.FOURTEEN) {
        await autoDiscard(
          userId,
          tableId,
          NUMERICAL.ONE,
          userPGP,
          tableGamePlay
        );
      }

      Logger.info(tableId, " userPGP :>>", userPGP);

      if (
        userPGP != null &&
        (userPGP.userStatus == PLAYER_STATE.DROP ||
          userPGP.userStatus == PLAYER_STATE.QUIT ||
          userPGP.userStatus == PLAYER_STATE.WRONG_SHOW ||
          userPGP.userStatus == PLAYER_STATE.DECLAREING)
      ) {
        winnerAmount += userPGP.looseingCash;
      }
    }

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const userData = tableGamePlay.seats[i];
      let userResData = <IUserResData>{};

      const userPGP: IDefaultPlayerGamePlay | null =
        await playerGamePlayCache.getPlayerGamePlay(userData.userId, tableId);
      Logger.info(tableId, "===== userPGP ====>>>", userPGP);

      if (
        userPGP !== null &&
        (userPGP.userStatus == PLAYER_STATE.DROP ||
          userPGP.userStatus == PLAYER_STATE.QUIT ||
          userPGP.userStatus == PLAYER_STATE.PLAYING ||
          userPGP.userStatus == PLAYER_STATE.WRONG_SHOW ||
          userPGP.userStatus == PLAYER_STATE.DECLAREING ||
          userPGP.userStatus == PLAYER_STATE.WON ||
          userPGP.userStatus == PLAYER_STATE.DISCONNECTED)
      ) {
        const { cards }: IManageAndUpdateData = await manageAndUpdateData(
          userPGP.currentCards,
          userPGP
        );

        userResData.userId = userData.userId;
        userResData.si = userData.si;
        userResData.pp = userData.pp;
        userResData.userName = userData.name;
        userResData.cards = cards;
        userResData.cards = cards;
        userResData.isDeclared = true;
      }

      if (status == PLAYER_STATE.WRONG_SHOW) {
        if (
          userPGP != null &&
          userData.userId != userId &&
          (userPGP.userStatus == PLAYER_STATE.PLAYING ||
            userPGP.userStatus == PLAYER_STATE.DISCONNECTED)
        ) {
          winnerUserId = userData.userId;
          winnerSI = userData.si;
          userResData.amount = `+${winnerAmount.toFixed(2)}`;
          userResData.result = PLAYER_STATE.WON;
          userResData.score = NUMERICAL.ZERO;
        }

        if (userPGP != null && userPGP.userStatus == PLAYER_STATE.QUIT) {
          userResData.amount = `-${(
            Number(tableConfig.entryFee) * NUMERICAL.EIGHTY
          ).toFixed(2)}`;
          userResData.result = PLAYER_STATE.LEAVE;
          userResData.score = NUMERICAL.EIGHTY;
        } else if (userPGP != null && userPGP.userStatus == PLAYER_STATE.DROP) {
          userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
          userResData.result = PLAYER_STATE.DROP;
          userResData.score = userPGP.dropScore;
        } else if (
          userPGP != null &&
          (userPGP.userStatus == PLAYER_STATE.WRONG_SHOW ||
            userPGP.userStatus == PLAYER_STATE.DECLAREING)
        ) {
          userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
          userResData.result = PLAYER_STATE.WRONG_SHOW;
          userResData.score = NUMERICAL.EIGHTY;
        }
      } else if (status == PLAYER_STATE.LEAVE) {
        if (userPGP != null && userPGP.userStatus == PLAYER_STATE.QUIT) {
          userResData.amount = `-${(
            Number(tableConfig.entryFee) * NUMERICAL.EIGHTY
          ).toFixed(2)}`;
          userResData.result = PLAYER_STATE.LEAVE;
          userResData.score = NUMERICAL.EIGHTY;
        } else if (userPGP != null && userPGP.userStatus == PLAYER_STATE.DROP) {
          userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
          userResData.result = PLAYER_STATE.DROP;
          userResData.score = userPGP.dropScore;
        } else if (
          userPGP != null &&
          userPGP.userStatus == PLAYER_STATE.WRONG_SHOW
        ) {
          userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
          userResData.result = PLAYER_STATE.WRONG_SHOW;
          userResData.score = NUMERICAL.EIGHTY;
        }

        if (
          (userPGP != null &&
            userData.userId != userId &&
            (userPGP.userStatus == PLAYER_STATE.PLAYING ||
              userPGP.userStatus == PLAYER_STATE.DECLAREING)) ||
          (userPGP != null && userPGP.userStatus == PLAYER_STATE.WON)
        ) {
          winnerUserId = userData.userId;
          winnerSI = userData.si;
          userResData.amount = `+${winnerAmount.toFixed(2)}`;
          userResData.result = PLAYER_STATE.WON;
          userResData.score = NUMERICAL.ZERO;
        }
      } else if (status == PLAYER_STATE.DROP) {
        if (
          userPGP != null &&
          userData.userId != userId &&
          userPGP.userStatus == PLAYER_STATE.PLAYING
        ) {
          winnerUserId = userPGP.userId;
          winnerSI = userPGP.seatIndex;
          userResData.result = PLAYER_STATE.WON;
          userResData.amount = `+${winnerAmount.toFixed(2)}`;
          userResData.score = NUMERICAL.ZERO;
        } else if (userPGP?.userStatus == PLAYER_STATE.DROP) {
          userResData.result = PLAYER_STATE.DROP;
          userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
          userResData.score = userPGP.dropScore;
        } else if (userPGP?.userStatus == PLAYER_STATE.WRONG_SHOW) {
          userResData.result = PLAYER_STATE.WRONG_SHOW;
          userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
          userResData.score = NUMERICAL.EIGHTY;
        } else if (userPGP?.userStatus == PLAYER_STATE.QUIT) {
          userResData.result = PLAYER_STATE.LEAVE;
          userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
          userResData.score = NUMERICAL.EIGHTY;
        }
      }

      Logger.info(tableId, " userResData ===============>>", userResData);
      if (userResData.userId) {
        allUserPGP.push(userResData);
      }
    }

    Logger.info(tableId, " allUserPGP ============>>", allUserPGP);

    let userArray: Array<IUserObj> = [];
    for (let i = 0; i < allUserPGP.length; i++) {
      const ele = allUserPGP[i];
      let userObj = <IUserObj>{};
      userObj.userId = ele.userId;
      userObj.si = ele.si;
      if (ele.result == PLAYER_STATE.WON) {
        userObj.bv = NUMERICAL.ZERO;
      } else {
        userObj.bv = Number(
          (ele.score * Number(tableConfig.entryFee)).toFixed(2)
        );
      }
      userArray.push(userObj);
    }

    Logger.info(
      tableId,
      "winnerUserId  :: ",
      winnerUserId,
      "winnerSI ::",
      winnerSI
    );

    if (winnerUserId == EMPTY || winnerSI == NUMERICAL.MINUS_ONE) {
      throw new Errors.UnknownError(`winner And Score Board Manage failed`);
    }

    return { winnerUserId, winnerSI, allUserPGP, userArray };
  } catch (error) {
    Logger.info(tableId, "winnerAndScoreBoardManage() Error : ", error);
    throw new Errors.UnknownError(`winner And Score Board Manage failed`);
  }
};

export default winnerAndScoreBoardManage;
