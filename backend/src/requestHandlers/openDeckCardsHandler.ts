import Logger from "../logger";
import Lock from "../lock";
import Errors from "../errors";
import { openDeckCardsFormator } from "../InputDataFormator";
import {
  IOpenDeckCardsInput,
  IOpenDeckCardsRes,
} from "../interfaces/inputOutputDataFormator";
import { tableGamePlayCache } from "../cache";
import { EVENT, MESSAGES, NUMERICAL, TABLE_STATE } from "../constants";
import { formatOpenDeckCardsData } from "../formatResponseData";
import commonEventEmitter from "../commonEventEmitter";

const openDeckCardsHandler = async (
  socket: any,
  openDeckCards: IOpenDeckCardsInput
) => {
  const socketId = socket.id;
  const userId = String(openDeckCards.userId) || socket.userId;
  const tableId = String(openDeckCards.tableId) || socket.tableId;

  let lock: any = null;

  try {
    const formatedOpenDeckCardsData = await openDeckCardsFormator(
      openDeckCards
    );

    Logger.info(
      tableId,
      " reqData : formatedOpenDeckCardsData =====>> ",
      formatedOpenDeckCardsData
    );

    lock = await Lock.getLock().acquire([`${userId}`], 2000);

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);

    if (!tableGamePlay)
      throw new Errors.UnknownError("Unable to get table data");

    if (
      tableGamePlay.tableState != TABLE_STATE.WINNER_DECLARED &&
      tableGamePlay.tableState != TABLE_STATE.SCORE_BOARD
    ) {
      const openDeck: string[] = tableGamePlay.opendDeck;
      const formatedOpenDeckCardsResData: IOpenDeckCardsRes =
        await formatOpenDeckCardsData(userId, tableId, openDeck);

      Logger.info(
        tableId,
        "formatedOpenDeckCardsData :: ",
        formatedOpenDeckCardsData
      );

      commonEventEmitter.emit(EVENT.SHOW_OPENDECK_CARDS_EVENT, {
        socket: socketId,
        tableId: tableId,
        data: formatedOpenDeckCardsResData,
      });

      return true;
    }
  } catch (error: any) {
    Logger.error(tableId, `openDeckCardsHandler Error :: ${error}`);

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
      commonEventEmitter.emit(EVENT.SHOW_OPENDECK_CARDS_EVENT, {
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
      Logger.error(tableId, error, " openDeckCardsHandler ");
    }
  }
};

export default openDeckCardsHandler;
