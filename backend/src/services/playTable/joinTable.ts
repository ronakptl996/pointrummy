import config from "../../config";
import Logger from "../../logger";
import Errors from "../../errors";
import { IErrorRes } from "../../interfaces/signup";
import { INewGTIResponse, IRejoinResponse } from "../../interfaces/tableConfig";
import { findUserFromSeatIndex } from "../../utils";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
  userProfileCache,
} from "../../cache";
import {
  getOnlinePlayerCountLobbyWise,
  incrCounterLobbyWise,
  setCounterInitialValueLobby,
} from "../../cache/onlinePlayer";
import {
  EMPTY,
  EVENT,
  MESSAGES,
  NUMERICAL,
  PLAYER_STATE,
  REDIS,
  TABLE_STATE,
} from "../../constants";
import commonEventEmitter from "../../commonEventEmitter";
import findTotalPlayersCount from "../userPlayTable/findTotalPlayers";
import { IDefaultPlayerGamePlay } from "../../interfaces/playerGamePlay";
import { emitJoinTableEvent } from "../emitEvents";
import { addGameRunningStatus } from "../../clientsideAPI";
import waitingForPlayerTimerStart from "../../scheduler/queues/waitingForPlayerTimerStart.queue";
import cancelWaitingForPlayerTimer from "../../scheduler/cancelJob/waitingForPlayerTimer.cancel";
import { roundStartTimer } from "../round";

const { WAIT_FOR_OTHER_PLAYER_TIMER } = config.getConfig();

const joinTable = async (
  response: INewGTIResponse | IRejoinResponse | IErrorRes,
  socket: any,
  reconnect: boolean
) => {
  const socketId = socket.id;
  let tempUserId: any;

  try {
    if (response && "tableId" in response) {
      const { tableId, seatIndex, playersDetail } = response;
      const userId: string = await findUserFromSeatIndex(
        seatIndex,
        playersDetail,
        tableId
      );

      tempUserId = userId;

      const [userProfile, playerGamePlay, tableGamePlay, tableConfig] =
        await Promise.all([
          userProfileCache.getUserProfile(userId),
          playerGamePlayCache.getPlayerGamePlay(userId.toString(), tableId),
          tableGamePlayCache.getTableGamePlay(tableId),
          tableConfigCache.getTableConfig(tableId),
        ]);

      if (!userProfile) throw Error("Unable to get user data");
      if (!playerGamePlay) throw Error("Unable to get player data");
      if (!tableGamePlay) throw Error("Unable to get table game play data");
      if (!tableConfig) throw Error("Unable to get table config data");

      Logger.info(
        tableId,
        "----->> joinTable :: playerGamePlay ::",
        playerGamePlay
      );
      Logger.info(
        tableId,
        "----->> joinTable :: tableGamePlay ::",
        tableGamePlay
      );
      Logger.info(tableId, " reconnect ::", reconnect);

      if (!reconnect) {
        // For Lobby wise online users
        let getOnlinePlayerCountLobbyWiseData =
          await getOnlinePlayerCountLobbyWise(
            REDIS.ONLINE_PLAYER_LOBBY,
            userProfile.lobbyId
          );

        Logger.info(
          "getOnlinePlayerCountLobbyWiseData :: ",
          getOnlinePlayerCountLobbyWiseData
        );

        if (!getOnlinePlayerCountLobbyWiseData)
          await setCounterInitialValueLobby(
            REDIS.ONLINE_PLAYER_LOBBY,
            userProfile.lobbyId
          );

        let countLobbyWise = await incrCounterLobbyWise(
          REDIS.ONLINE_PLAYER_LOBBY,
          userProfile.lobbyId
        );

        Logger.info("countLobbyWise :: count :: ", countLobbyWise);

        Logger.info(
          tableId,
          " tableGamePlay.tableState ==> :: ",
          tableGamePlay.tableState
        );

        await emitJoinTableEvent(
          tableId,
          tableGamePlay,
          tableConfig,
          userProfile,
          socket.id,
          reconnect,
          playerGamePlay
        );

        Logger.info(tableId, "<<== join_table send ==>>");

        const tableGamePlayInfo = await tableGamePlayCache.getTableGamePlay(
          tableId
        );

        if (!tableGamePlayInfo)
          throw Error("Unable to get table game play data");

        const totalPlayersCount = await findTotalPlayersCount(
          tableGamePlay,
          tableId
        );

        Logger.info(
          tableId,
          " totalPlayersCount ==========>>>",
          totalPlayersCount
        );

        // Add Game Running Status
        const apiData = {
          tableId,
          tournamentId: userProfile.lobbyId,
          gameId: userProfile.gameId,
        };

        const addGameRunningDetail = await addGameRunningStatus(
          apiData,
          userProfile.authToken,
          userProfile.socketId,
          userProfile.userId
        );

        if (totalPlayersCount < tableConfig.noOfPlayer) {
          let key = `${tableConfig.lobbyId}`;
          let getTableQueueArr = await tableConfigCache.getTableFromQueue(key);
          let arrayData =
            getTableQueueArr && getTableQueueArr.tableId.length > NUMERICAL.ZERO
              ? getTableQueueArr.tableId
              : [];
          arrayData.push(tableId);

          Logger.info(tableId, "arrayData :>> ", arrayData);

          await tableConfigCache.setTableFromQueue(key, { tableId: arrayData });
        }

        let PGP: IDefaultPlayerGamePlay | null =
          await playerGamePlayCache.getPlayerGamePlay(
            userId.toString(),
            tableId
          );
        if (PGP?.userStatus === PLAYER_STATE.PLAYING) {
          if (
            tableConfig.noOfPlayer === NUMERICAL.FOUR ||
            tableConfig.noOfPlayer === NUMERICAL.SIX
          ) {
            if (totalPlayersCount === tableConfig.minPlayer) {
              Logger.info(tableId, "waiting For Player Timer Popup send.");

              commonEventEmitter.emit(EVENT.WAITING_TIMER_START, {
                tableId: tableId,
                data: {
                  waitingTimer: Number(
                    WAIT_FOR_OTHER_PLAYER_TIMER / NUMERICAL.THOUSAND
                  ),
                  tableId,
                },
              });

              tableGamePlay.tableState = TABLE_STATE.WAITING_FOR_PLAYERS;
              tableGamePlay.updatedAt = new Date().toString();
              tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

              Logger.info(
                tableId,
                "WAIT_FOR_OTHER_PLAYER_TIMER :>> ",
                WAIT_FOR_OTHER_PLAYER_TIMER
              );

              await waitingForPlayerTimerStart({
                timer:
                  Number(WAIT_FOR_OTHER_PLAYER_TIMER) + NUMERICAL.FIVE_HUNDRED,
                jobId: `waitingForPlayerTimer:${tableId}`,
                tableId,
                currentRound: tableConfig.currentRound,
              });
            } else if (tableConfig.noOfPlayer === totalPlayersCount) {
              await cancelWaitingForPlayerTimer(
                `waitingForPlayerTimer:${tableId}`,
                tableId
              );
              if (
                tableGamePlay.tableState === TABLE_STATE.WAIT_FOR_OTHER_PLAYERS
              ) {
                await roundStartTimer(tableId, tableConfig.currentRound);
              }
            }
          } else {
            if (totalPlayersCount === tableConfig.minPlayer) {
              await roundStartTimer(tableId, tableConfig.currentRound);
            }
          }
        } else if (PGP?.userStatus == PLAYER_STATE.WATCHING) {
          let nonProdMsg = "user in watching mode";
          commonEventEmitter.emit(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
            socket: socketId,
            data: {
              isPopup: true,
              popupType: MESSAGES.ALERT_MESSAGE.TYPE.BOTTOM_TOAST_POPUP,
              title: nonProdMsg,
              message:
                MESSAGES.ERROR
                  .YOU_ARE_SEAT_IN_WATCHING_MODE_PLEASE_WAITING_FOR_NEW_GAME_START,
              showTimer: false,
              tableId,
            },
          });
        } else {
          throw new Errors.UnknownError("some error at discardCard");
        }
      }
    }
    return { success: true, error: null };
  } catch (error) {
    Logger.error(
      error,
      ` table ${
        response && "tableId" in response ? response["tableId"] : ""
      }  user ${tempUserId} function  joinTable`
    );

    if (error instanceof Errors.UnknownError) {
      let nonProdMsg = "Join Table Failed";
      let msg = MESSAGES.ERROR.COMMON_ERROR;

      commonEventEmitter.emit(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: msg,
          tableId: EMPTY,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    }

    throw new Error(`function  joinTable error ${error}`);
  }
};

export default joinTable;
