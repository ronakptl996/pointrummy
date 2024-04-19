import Logger from "../logger";
import Lock from "../lock";
import Errors from "../errors";
import {
  IDeclareDataInput,
  IDeclareDataResponse,
} from "../interfaces/inputOutputDataFormator";
import { declareDataFormator } from "../InputDataFormator";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../cache";
import {
  EMPTY,
  EVENT,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from "../constants";
import declarePlayerTurnTimer from "../scheduler/queues/declarePlayerTurnTimer.queue";
import { IDefaultPlayerGamePlay } from "../interfaces/playerGamePlay";
import { formatDeclareData } from "../formatResponseData";
import commonEventEmitter from "../commonEventEmitter";

const declareHandler = async (socket: any, declareData: IDeclareDataInput) => {
  let socketId = socket.id;
  const userId = String(declareData.userId) || socket.userId;
  const tableId = String(declareData.tableId) || socket.tableId;
  let lock: any = null;

  try {
    const formatedDeclareData = await declareDataFormator(declareData);

    Logger.info(
      tableId,
      " reqData : formatedDeclareData ===>> ",
      formatedDeclareData
    );

    lock = await Lock.getLock().acquire([`${tableId}`], 2000);

    const [playerGamePlay, tableGamePlay, tableConfig, userProfile] =
      await Promise.all([
        playerGamePlayCache.getPlayerGamePlay(userId, tableId),
        tableGamePlayCache.getTableGamePlay(tableId),
        tableConfigCache.getTableConfig(tableId),
        userProfileCache.getUserProfile(userId),
      ]);

    if (!playerGamePlay)
      throw new Errors.UnknownError("Unable to get player data");
    if (!tableGamePlay)
      throw new Errors.UnknownError("Unable to get table data");
    if (!tableConfig)
      throw new Errors.UnknownError("Unable to get table config data");
    if (!userProfile)
      throw new Errors.UnknownError("Unable to get user Profile data");

    if (socketId != userProfile.socketId) {
      socketId = userProfile.socketId;
    }

    const currentCardsLengthCheck: string[] = [];
    playerGamePlay.currentCards.map((ele) => {
      ele.map((e: string) => {
        currentCardsLengthCheck.push(e);
      });
    });

    var userSeatIndex: number = NUMERICAL.ZERO;
    tableGamePlay.seats.map((ele, ind) => {
      if (ele.userId == userId) {
        userSeatIndex = ele.si;
      }
    });

    Logger.info(
      tableId,
      " currentCardsLengthCheck ::",
      currentCardsLengthCheck
    );
    Logger.info(
      tableId,
      " playerGamePlay.userStatus ::",
      playerGamePlay.userStatus
    );

    if (
      tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
      tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD
    ) {
      if (
        currentCardsLengthCheck.length == NUMERICAL.THIRTEEN &&
        playerGamePlay.userStatus == PLAYER_STATE.DECLAREING
      ) {
        if (playerGamePlay.cardPoints == NUMERICAL.ZERO) {
          let validDeclareUserName: string = EMPTY;
          var userSI: number = NUMERICAL.ZERO;
          tableGamePlay.tableState = TABLE_STATE.DECLARED;
          tableGamePlay.validDeclaredPlayer = userId;
          tableGamePlay.seats.map((ele, ind) => {
            if (ele.userId == userId) {
              userSI = ele.si;
            }
          });
          tableGamePlay.validDeclaredPlayerSI = userSI;
          tableGamePlay.updatedAt = new Date().toString();
          playerGamePlay.userStatus = PLAYER_STATE.WON;

          for (let i = 0; i < tableGamePlay.seats.length; i++) {
            const ele = tableGamePlay.seats[i];
            if (ele.userId == userId) {
              ele.userState = PLAYER_STATE.WON;
              validDeclareUserName = ele.name;
            }
          }
          tableGamePlay.finishCount.push(userId);

          let PromiseArr: any[] = [];
          let siArrayOfdeclaringTimeStart = <number[]>[];
          for (let i = 0; i < tableGamePlay.seats.length; i++) {
            const ele = tableGamePlay.seats[i];

            const userPGP: IDefaultPlayerGamePlay | null =
              await playerGamePlayCache.getPlayerGamePlay(ele.userId, tableId);
            let otherUserDeclareData = <IDeclareDataInput>{};
            otherUserDeclareData.tableId = tableId;
            otherUserDeclareData.currentRound = NUMERICAL.ONE;
            if (ele.userId != userId) {
              otherUserDeclareData.userId = ele.userId;
            }
            Logger.info(
              tableId,
              " otherUserDeclareData :: ",
              otherUserDeclareData
            );

            if (
              ele.userId != userId &&
              userPGP?.userStatus == PLAYER_STATE.PLAYING
            ) {
              siArrayOfdeclaringTimeStart.push(userPGP.seatIndex);
            }

            if (ele.userId != userId && ele.userState == PLAYER_STATE.PLAYING) {
              Logger.info(
                tableId,
                "ele.userStatus :: ",
                ele.userState,
                "ele.userId :: ",
                ele.userId
              );
              await declarePlayerTurnTimer({
                timer: tableConfig.declareTimer,
                jobId: `declare:${tableId}:${ele.userId}:${tableConfig.currentRound}`,
                data: otherUserDeclareData,
              });
            }
          }

          Logger.info(
            tableId,
            "All user Timer Start : PromiseArr ==>>",
            PromiseArr
          );

          await Promise.all([
            playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId),
            tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId),
          ]);

          const formatedDeclareDataRes: IDeclareDataResponse =
            await formatDeclareData(
              tableId,
              userId,
              userSeatIndex,
              tableConfig.declareTimer,
              siArrayOfdeclaringTimeStart,
              TABLE_STATE.DECLARED,
              tableGamePlay.tableState
            );

          Logger.info(
            tableId,
            "formatedDeclareDataRes : Zero ==>> ::",
            formatedDeclareDataRes
          );

          commonEventEmitter.emit(EVENT.DECLARE_SOCKET_EVENT, {
            tableId: tableId,
            data: formatedDeclareDataRes,
          });

          // (IMP)
        }
      }
    }
  } catch (error) {}
};
