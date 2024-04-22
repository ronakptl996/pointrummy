import Logger from "../../../logger";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../../cache";
import Errors from "../../../errors";
import { IDefaultPlayerGamePlay } from "../../../interfaces/playerGamePlay";
import {
  EVENT,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from "../../../constants";
import { IScoreBoardRes, IUserResData } from "../../../interfaces/tableConfig";
import { IManageAndUpdateData } from "../../../interfaces/round";
import manageAndUpdateData from "../../../utils/manageCardData";
import { IUserObj } from "../../../interfaces/winner";
import winnerHandler from "..";
import { diffSeconds } from "../../../common";
import scoreBoardManage from "./scoreBoardManage";
import { formatNewScoreBoardData } from "../../../formatResponseData";
import { IUserProfileOutput } from "../../../interfaces/userProfile";
import commonEventEmitter from "../../../commonEventEmitter";

const scoreBoardCalculation = async (tableId: string, userId: string) => {
  try {
    const [playerGamePlay, tableGamePlay, tableConfig] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
      tableConfigCache.getTableConfig(tableId),
    ]);

    if (!playerGamePlay)
      throw new Errors.UnknownError("Unable to get player data");
    if (!tableGamePlay)
      throw new Errors.UnknownError("Unable to get table data");
    if (!tableConfig) throw new Errors.UnknownError("Unable to get table data");

    Logger.info(
      tableId,
      "tableGamePlay.finishCount ::>>",
      tableGamePlay.finishCount,
      tableGamePlay.finishCount.length
    );
    Logger.info(
      tableId,
      "tableGamePlay.currentPlayerInTable ::>>",
      tableGamePlay.currentPlayerInTable
    );

    if (
      tableGamePlay.finishCount.length === tableGamePlay.currentPlayerInTable
    ) {
      Logger.info(tableId, "<<=== ScoreBoard ===>>");
      let winnerUserID: string = "";
      let winnerSeatIndex: number = NUMERICAL.ZERO;
      let firstTurnDeclare: boolean = false;

      //winner find
      for (let i = 0; i < tableGamePlay.seats.length; i++) {
        const ele = tableGamePlay.seats[i];
        const userPGP: IDefaultPlayerGamePlay | null =
          await playerGamePlayCache.getPlayerGamePlay(ele.userId, tableId);
        if (userPGP != null && userPGP.userStatus == PLAYER_STATE.WON) {
          //DECLARED means WON
          winnerUserID = userPGP.userId;
          winnerSeatIndex = userPGP.seatIndex;
          if (tableGamePlay.totalPickCount == NUMERICAL.ONE) {
            firstTurnDeclare = true;
          }
        }
      }
      Logger.info(tableId, "firstTurnDeclare >>", firstTurnDeclare);

      let wonScore: number = NUMERICAL.ZERO;
      let allUserPGP: IUserResData[] = [];

      //winner user score calculation
      for (let i = 0; i < tableGamePlay.seats.length; i++) {
        const ele = tableGamePlay.seats[i];
        const userPGP: IDefaultPlayerGamePlay | null =
          await playerGamePlayCache.getPlayerGamePlay(ele.userId, tableId);
        if (userPGP?.userStatus == PLAYER_STATE.LOSS) {
          if (userPGP.cardPoints == NUMERICAL.ZERO) {
            userPGP.cardPoints = NUMERICAL.TWO;
          }
          wonScore = wonScore + userPGP.cardPoints * tableConfig.entryFee;
        } else if (
          userPGP?.userStatus == PLAYER_STATE.DROP ||
          userPGP?.userStatus == PLAYER_STATE.QUIT ||
          userPGP?.userStatus == PLAYER_STATE.WRONG_SHOW
        ) {
          wonScore = wonScore + userPGP.looseingCash;
        }
      }

      //all user score Board related data set.
      for (let i = 0; i < tableGamePlay.seats.length; i++) {
        const userData = tableGamePlay.seats[i];
        let userResData = <IUserResData>{};

        const userPGP: IDefaultPlayerGamePlay | null =
          await playerGamePlayCache.getPlayerGamePlay(userData.userId, tableId);
        if (
          userPGP != null &&
          userPGP.userStatus != PLAYER_STATE.WATCHING &&
          userPGP.userStatus != PLAYER_STATE.WATCHING_LEAVE
        ) {
          userResData.userId = userData.userId;
          userResData.si = userData.si;
          userResData.pp = userData.pp;
          userResData.userName = userData.name;
          userResData.isDeclared = true;

          const {
            cards,
            totalScorePoint,
            playerGamePlayUpdated,
          }: IManageAndUpdateData = await manageAndUpdateData(
            userPGP.currentCards,
            userPGP
          );

          playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
          userResData.cards = cards;
          userResData.score = totalScorePoint;

          if (userPGP.userStatus == PLAYER_STATE.WON) {
            userResData.result = PLAYER_STATE.WON;
            userResData.amount = `+${wonScore.toFixed(2)}`;
            userResData.score = NUMERICAL.ZERO;
          } else if (userPGP.userStatus == PLAYER_STATE.QUIT) {
            userResData.result = PLAYER_STATE.LEAVE;
            userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
            userResData.score = NUMERICAL.EIGHTY;
          } else if (userPGP.userStatus == PLAYER_STATE.DROP) {
            userResData.result = PLAYER_STATE.DROP;
            userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
            userResData.score = userPGP.dropScore;
          } else if (userPGP.userStatus == PLAYER_STATE.WRONG_SHOW) {
            userResData.result = PLAYER_STATE.WRONG_SHOW;
            userResData.amount = `-${userPGP.looseingCash.toFixed(2)}`;
            userResData.score = NUMERICAL.EIGHTY;
          } else if (userPGP.userStatus == PLAYER_STATE.LOSS) {
            if (userPGP.cardPoints == NUMERICAL.ZERO) {
              userPGP.cardPoints = NUMERICAL.TWO;
              userResData.score = NUMERICAL.TWO;
            }
            const lossAmount = (
              userPGP.cardPoints * tableConfig.entryFee
            ).toFixed(2);
            userResData.result = PLAYER_STATE.LOSS;
            userResData.amount =
              lossAmount > `${NUMERICAL.ZERO}`
                ? `-${lossAmount}`
                : `${lossAmount}`;
          }
        }

        if (firstTurnDeclare) {
          if (userPGP?.userStatus == PLAYER_STATE.WON) {
            let temp = Math.abs(Number(userResData.amount)) / NUMERICAL.TWO;
            userResData.amount = `+${temp.toFixed(2)}`;
          } else {
            let socre_data =
              userPGP?.cardPoints == NUMERICAL.TWO
                ? NUMERICAL.TWO
                : Number(userPGP?.cardPoints) / NUMERICAL.TWO;
            let temp = Math.abs(Number(userResData.amount)) / NUMERICAL.TWO;
            userResData.amount = `-${temp.toFixed(2)}`;
            userResData.score = socre_data;
          }
        }
        if (userResData.userId) {
          allUserPGP.push(userResData);
        }
      }
      Logger.info(tableId, " allUserPGP =====>>", allUserPGP);

      //all user winner chips collection calculation.
      let userArray: Array<IUserObj> = [];
      for (let i = 0; i < allUserPGP.length; i++) {
        const ele = allUserPGP[i];
        const userPGP: IDefaultPlayerGamePlay | null =
          await playerGamePlayCache.getPlayerGamePlay(ele.userId, tableId);
        if (userPGP != null) {
          let userObj = <IUserObj>{};
          userObj.userId = ele.userId;
          userObj.si = ele.si;
          if (firstTurnDeclare) {
            if (userPGP.userStatus == PLAYER_STATE.LOSS) {
              userObj.bv = ele.score * Number(tableConfig.entryFee);
            } else if (userPGP.userStatus == PLAYER_STATE.WON) {
              userObj.bv = NUMERICAL.ZERO;
            } else {
              userObj.bv = Number(userPGP.looseingCash.toFixed(2));
            }
          } else {
            if (userPGP.userStatus == PLAYER_STATE.LOSS) {
              userObj.bv =
                (ele.score * Number(tableConfig.entryFee)) / NUMERICAL.TWO;
            } else if (userPGP.userStatus == PLAYER_STATE.WON) {
              userObj.bv = NUMERICAL.ZERO;
            } else {
              userObj.bv = Number(
                (userPGP.looseingCash / NUMERICAL.TWO).toFixed(2)
              );
            }
          }
          userArray.push(userObj);
        }
      }
      tableGamePlay.tableState = TABLE_STATE.WINNER_DECLARED;
      await Promise.all([
        tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
        playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
      ]);

      await winnerHandler(
        winnerUserID,
        winnerSeatIndex,
        tableId,
        allUserPGP,
        tableGamePlay,
        false
      );
    } else {
      Logger.info(tableId, " ELSE CALL ....");

      let rTimer: number = NUMERICAL.ZERO;
      rTimer =
        diffSeconds(new Date(), new Date(tableGamePlay.updatedAt)) *
        NUMERICAL.THOUSAND;

      if (tableGamePlay.tableState === TABLE_STATE.DECLARED) {
        rTimer =
          Math.ceil(tableConfig.declareTimer - rTimer) / NUMERICAL.THOUSAND;
      }
      console.log("rTimer :===>> ", rTimer);

      const allUserPGP: IUserResData[] = (await scoreBoardManage(
        userId,
        tableId
      )) as IUserResData[];

      for await (const element of allUserPGP) {
        if (
          element.result !== PLAYER_STATE.DECLAREING &&
          element.result !== PLAYER_STATE.LEAVE
        ) {
          let scoreData: IScoreBoardRes;
          if (element.result == PLAYER_STATE.LOSS) {
            scoreData = await formatNewScoreBoardData(
              tableId,
              allUserPGP,
              tableGamePlay.trumpCard,
              rTimer,
              true
            );
          } else {
            scoreData = await formatNewScoreBoardData(
              tableId,
              allUserPGP,
              tableGamePlay.trumpCard,
              rTimer,
              false
            );
          }

          const userProfile = (await userProfileCache.getUserProfile(
            element.userId
          )) as IUserProfileOutput;
          const userPGP = (await playerGamePlayCache.getPlayerGamePlay(
            element.userId,
            tableId
          )) as IDefaultPlayerGamePlay;

          if (
            userProfile.tableId === tableId &&
            userPGP &&
            !userPGP.isDropAndMove
          ) {
            commonEventEmitter.emit(EVENT.SCORE_BOARD_CLIENT_SOCKET_EVENT, {
              socket: userProfile.socketId,
              tableId: tableId,
              data: scoreData,
            });
          }
        }
      }

      for await (const ele of tableGamePlay.seats) {
        if (ele.userState == PLAYER_STATE.WATCHING) {
          const scoreData: IScoreBoardRes = await formatNewScoreBoardData(
            tableId,
            allUserPGP,
            tableGamePlay.trumpCard,
            rTimer,
            false
          );
          const userProfile = (await userProfileCache.getUserProfile(
            ele.userId
          )) as IUserProfileOutput;
          const userPGP = (await playerGamePlayCache.getPlayerGamePlay(
            ele.userId,
            tableId
          )) as IDefaultPlayerGamePlay;
          if (
            userProfile.tableId === tableId &&
            userPGP &&
            !userPGP.isDropAndMove
          ) {
            commonEventEmitter.emit(EVENT.SCORE_BOARD_CLIENT_SOCKET_EVENT, {
              socket: userProfile.socketId,
              tableId: tableId,
              data: scoreData,
            });
          }
        }
      }
    }
  } catch (error) {
    Logger.info(tableId, "scoreBoardCalculation   error: " + error);
  }
};

export default scoreBoardCalculation;
