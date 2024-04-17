import Logger from "../logger";
import Lock from "../lock";
import Errors from "../errors";
import { saveCardsInSortsFormator } from "../InputDataFormator";
import {
  ICardSortsRes,
  ISaveCardsInSortsInput,
} from "../interfaces/inputOutputDataFormator";
import { playerGamePlayCache, tableGamePlayCache } from "../cache";
import { EVENT, MESSAGES, NUMERICAL, TABLE_STATE } from "../constants";
import { cardGroups, sortCard } from "../utils/cardLogic";
import autoMakeGroup from "../utils/autoMakeGroup";
import manageAndUpdateData from "../utils/manageCardData";
import { IManageAndUpdateData } from "../interfaces/round";
import { formatCardsSortsData } from "../formatResponseData";
import commonEventEmitter from "../commonEventEmitter";

const saveCardsInSortsHandler = async (
  socket: any,
  saveCards: ISaveCardsInSortsInput
) => {
  const socketId = socket.id;
  const userId = String(saveCards.userId) || socket.userId;
  const tableId = String(saveCards.tableId) || socket.tableId;

  let lock: any = null;

  try {
    const formatedSaveCardsInSortsData = await saveCardsInSortsFormator(
      saveCards
    );

    Logger.info(
      tableId,
      " reqData : formatedSaveCardsInSortsData ====>> ",
      formatedSaveCardsInSortsData
    );

    lock = await Lock.getLock().acquire([`${userId}`], 2000);

    const [playerGamePlay, tableGamePlay] = await Promise.all([
      playerGamePlayCache.getPlayerGamePlay(userId, tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
    ]);

    if (!playerGamePlay)
      throw new Errors.UnknownError("Unable to get player data");
    if (!tableGamePlay)
      throw new Errors.UnknownError("Unable to get table data");

    if (
      tableGamePlay.tableState !== TABLE_STATE.WINNER_DECLARED &&
      tableGamePlay.tableState !== TABLE_STATE.SCORE_BOARD
    ) {
      let newCardArr = [];
      for (let i = 0; i < playerGamePlay.currentCards.length; i++) {
        newCardArr.push(playerGamePlay.currentCards[i]);
      }

      const Groups: string[][] = await cardGroups(newCardArr);
      const allPromise: any[] = [];

      for (let i = 0; i < Groups.length; i++) {
        const element = Groups[i];
        allPromise.push(sortCard(element));
      }

      const allPromiseSorts = await Promise.all(allPromise);

      let isGroupMakesArr = await autoMakeGroup(allPromiseSorts);
      let newGroupCheckArray: any =
        typeof isGroupMakesArr == "boolean" ? allPromiseSorts : isGroupMakesArr;

      Logger.info(tableId, "newGroupCheckArray :: ==>> ", newGroupCheckArray);

      const result = newGroupCheckArray.filter(
        (ele: any) => ele.length > NUMERICAL.ZERO
      );
      Logger.info(tableId, "<<=== result ===>>", result);

      const {
        cards,
        totalScorePoint,
        playerGamePlayUpdated,
      }: IManageAndUpdateData = await manageAndUpdateData(
        result,
        playerGamePlay
      );

      playerGamePlay.currentCards = playerGamePlayUpdated.currentCards;
      playerGamePlay.groupingCards = playerGamePlayUpdated.groupingCards;
      playerGamePlay.cardPoints = totalScorePoint;

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);

      const formatedCardSortsData: ICardSortsRes = await formatCardsSortsData(
        playerGamePlay.userId,
        tableId,
        cards,
        totalScorePoint
      );

      Logger.info(
        tableId,
        " formatedCardGroupsData :: ",
        formatedCardSortsData
      );

      commonEventEmitter.emit(EVENT.SAVE_CARDS_IN_SORTS_SOCKET_EVENT, {
        socket: socketId,
        tableId: tableId,
        data: formatedCardSortsData,
      });
      return true;
    }
  } catch (error: any) {
    Logger.error(tableId, `saveCardsInSortsHandler Error :: ${error}`);

    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;

    if (error instanceof Errors.InvalidInput) {
      nonProdMsg = "Invalid Input";
      commonEventEmitter.emit(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: msg,
          tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else if (error instanceof Errors.UnknownError) {
      nonProdMsg = "FAILED";

      commonEventEmitter.emit(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, {
        socket: socketId,
        data: {
          isPopup: true,
          popupType: MESSAGES.ALERT_MESSAGE.TYPE.COMMON_POPUP,
          title: nonProdMsg,
          message: msg,
          tableId,
          buttonCounts: NUMERICAL.ONE,
          button_text: [MESSAGES.ALERT_MESSAGE.BUTTON_TEXT.EXIT],
          button_color: [MESSAGES.ALERT_MESSAGE.BUTTON_COLOR.RED],
          button_methods: [MESSAGES.ALERT_MESSAGE.BUTTON_METHOD.EXIT],
        },
      });
    } else {
      commonEventEmitter.emit(EVENT.SAVE_CARDS_IN_SORTS_SOCKET_EVENT, {
        socket: socketId,
        data: {
          success: false,
          error: {
            errorCode,
            errorMessage:
              error && error.message && typeof error.message === "string"
                ? error.message
                : nonProdMsg,
          },
        },
      });
    }
  } finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId, error, " leaveTable ");
    }
  }
};

export default saveCardsInSortsHandler;
