import Logger from "../../logger";
import config from "../../config";
import {
  EMPTY,
  EVENT,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from "../../constants";
import { IScoreBoardRes, IUserResData } from "../../interfaces/tableConfig";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import { removeQueue } from "../common/queue";
import {
  lastDealCache,
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  turnHistoryCache,
  userProfileCache,
} from "../../cache";
import {
  formatNewScoreBoardData,
  formatScoreBoardData,
} from "../../formatResponseData";
import cancelAllScheduler from "../../scheduler/cancelJob/allScheduler.cancel";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import { IDefaultPlayerGamePlay } from "../../interfaces/playerGamePlay";
import commonEventEmitter from "../../commonEventEmitter";
import formatMultiPlayerScore from "../../clientsideAPI/helper/formatMultiPlayerSubmitScore";
import scoreBoardTimer from "../../scheduler/queues/scoreBoardTimer.queue";

const { NEW_GAME_START_TIMER } = config.getConfig();

const winnerHandler = async (
  winnerUserId: string,
  winnerSI: number,
  tableId: string,
  allUserPGP: Array<IUserResData>,
  tableGamePlay: IDefaultTableGamePlay,
  isDirectWinner: boolean
) => {
  try {
    Logger.info(
      tableId,
      "FINAL winnerhandler  tableId ::============================>>",
      tableId
    );
    Logger.info(
      tableId,
      " Starting winnerhandler :: >> NEW_GAME_START_TIMER :: ",
      NEW_GAME_START_TIMER
    );
    Logger.info(tableId, "winnerhandler :: allUserPGP :: => ", allUserPGP);

    await removeQueue(tableId);

    Logger.info(tableId, "tableGamePlay :: >>", tableGamePlay);
    tableGamePlay.tableState = TABLE_STATE.SCORE_BOARD;
    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    // Score Board Event
    let newGameStartTimer: number = NEW_GAME_START_TIMER / NUMERICAL.THOUSAND;

    const scoreData = await formatScoreBoardData(
      tableId,
      allUserPGP,
      tableGamePlay.trumpCard,
      newGameStartTimer,
      true
    );

    // last deal set
    const playerListArr = scoreData.scoreBoardTable;
    for (let i = 0; i < playerListArr.length; i++) {
      const userData = playerListArr[i];
      await lastDealCache.setLastDeal(userData.userId, scoreData);
    }

    const [winnerUserProfile, tableConfig] = await Promise.all([
      userProfileCache.getUserProfile(winnerUserId),
      tableConfigCache.getTableConfig(tableId),
    ]);
    if (!tableConfig) throw new Error("Unable to get table config");
    if (!winnerUserProfile) throw new Error("Unable to get user data");

    // Cancel All Timer
    await cancelAllScheduler(tableId);

    // Remove Queue if Available
    const key = `${tableConfig.lobbyId}`;
    let getTableQueueArr = await tableConfigCache.getTableFromQueue(key);
    if (getTableQueueArr) {
      Logger.info(tableId, "getTableQueueArr :: Before :>> ", getTableQueueArr);
      getTableQueueArr.tableId = getTableQueueArr.tableId.filter(
        (x: any) => x != tableId
      );
    }

    Logger.info(tableId, "getTableQueueArr :: After:>> ", getTableQueueArr);

    await tableConfigCache.setTableFromQueue(key, getTableQueueArr);

    for await (const element of allUserPGP) {
      if (
        element.result !== PLAYER_STATE.DECLAREING &&
        element.result !== PLAYER_STATE.LEAVE
      ) {
        let scoreData: IScoreBoardRes = <IScoreBoardRes>{};
        if (isDirectWinner) {
          scoreData = await formatNewScoreBoardData(
            tableId,
            allUserPGP,
            tableGamePlay.trumpCard,
            newGameStartTimer,
            true,
            true
          );
        } else {
          if (element.result === PLAYER_STATE.LOSS) {
            scoreData = await formatNewScoreBoardData(
              tableId,
              allUserPGP,
              tableGamePlay.trumpCard,
              newGameStartTimer,
              true,
              true
            );
          } else {
            scoreData = await formatNewScoreBoardData(
              tableId,
              allUserPGP,
              tableGamePlay.trumpCard,
              newGameStartTimer,
              false,
              true
            );
          }
        }

        const userProfile = (await userProfileCache.getUserProfile(
          element.userId
        )) as IUserProfileOutput;
        const userPGP = (await playerGamePlayCache.getPlayerGamePlay(
          element.userId,
          tableId
        )) as IDefaultPlayerGamePlay;

        Logger.info(
          tableId,
          "winnerhandler ::> userProfile  ===>>",
          userProfile
        );
        Logger.info(tableId, "winnerhandler ::> userPGP  =====>>", userPGP);

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
        let scoreData: IScoreBoardRes = <IScoreBoardRes>{};
        if (isDirectWinner) {
          scoreData = await formatNewScoreBoardData(
            tableId,
            allUserPGP,
            tableGamePlay.trumpCard,
            newGameStartTimer,
            true,
            true
          );
        } else {
          scoreData = await formatNewScoreBoardData(
            tableId,
            allUserPGP,
            tableGamePlay.trumpCard,
            newGameStartTimer,
            false,
            true
          );
        }

        const userProfile = (await userProfileCache.getUserProfile(
          ele.userId
        )) as IUserProfileOutput;
        const userPGP = (await playerGamePlayCache.getPlayerGamePlay(
          ele.userId,
          tableId
        )) as IDefaultPlayerGamePlay;

        Logger.info(
          tableId,
          "winnerhandler :: > userProfile  =====>>",
          userProfile
        );
        Logger.info(tableId, "winnerhandler ::> userPGP  ======>>", userPGP);

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
      let userProfile = (await userProfileCache.getUserProfile(
        ele.userId
      )) as IUserProfileOutput;
      Logger.info(tableId, "User profile ::>>>", userProfile);

      if (userProfile.tableId === tableId) {
        userProfile.tableIds = userProfile.tableIds.filter(
          (el) => tableId != el
        );

        userProfile.tableId =
          userProfile.tableIds.length === 0
            ? EMPTY
            : userProfile.tableIds[NUMERICAL.ZERO];

        Logger.info(
          tableId,
          "  winnerhandler :: userProfile.tableId ::",
          userProfile.tableId,
          "userProfile.tableIds ::=>",
          userProfile.tableIds
        );

        await userProfileCache.setUserProfile(ele.userId, userProfile);
      }
    }

    // For multi player score format and submit api
    const apiData = await formatMultiPlayerScore(
      tableId,
      winnerUserId,
      winnerSI,
      allUserPGP
    );

    if (!apiData) throw Error("format Multi Player Score not found !");

    // Client API Call

    // mark Completed Game Status for all user
    for await (const ele of tableGamePlay.seats) {
      const userProfile = (await userProfileCache.getUserProfile(
        ele.userId
      )) as IUserProfileOutput;

      // Client API Call
    }
    await turnHistoryCache.deleteTurnHistory(tableId);

    // next round start scoreBoard timer
    await scoreBoardTimer({
      timer: Number(NEW_GAME_START_TIMER),
      jobId: `StartScoreBoardTimer:${tableId}`,
      tableId,
    });

    Logger.info(tableId, " SCOREDATA :data ===", scoreData);

    return true;
  } catch (error) {
    Logger.error(tableId, `winnerhandler Error :: ${error}`);
    Logger.info(tableId, "<<===== winnerhandler() Error ======>>", error);
  }
};

export default winnerHandler;
