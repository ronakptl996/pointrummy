import Logger from "../../logger";
import {
  EVENT,
  MESSAGES,
  NUMERICAL,
  PLAYER_STATE,
  TABLE_STATE,
} from "../../constants";
import commonEventEmitter from "../../commonEventEmitter";
import Errors from "../../errors";
import getAllPlayingUser from "../common/getAllPlayingUser";
import { tableGamePlayCache, tableConfigCache } from "../../cache";

const firstRoundBootCollect = async (tableId: string, currentRound: number) => {
  try {
    Logger.info(
      tableId,
      `Starting firstRoundBootCollect for tableId : ${tableId}`
    );
    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
    ]);
    if (!tableGamePlay || !tableConfig) throw Error("Unable to get table data");

    let collectBootValueSIArray = <Array<number>>[];
    tableGamePlay.seats.map((ele) => {
      if (ele.userState == PLAYER_STATE.PLAYING) {
        collectBootValueSIArray.push(ele.si);
      }
    });

    Logger.info(
      tableId,
      " collectBootValueSIArray :: ",
      collectBootValueSIArray
    );

    tableGamePlay.tableState = TABLE_STATE.COLLECTING_BOOT_VALUE;
    tableGamePlay.potValue =
      tableConfig.entryFee *
      tableGamePlay.currentPlayerInTable *
      NUMERICAL.EIGHTY;

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    const TGP = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!TGP) {
      throw Error("Unable to get TGP data");
    }

    const getAllPlayingPlayer = getAllPlayingUser(TGP.seats);
    Logger.info(
      tableId,
      `roundDealerSetTimer getAllPlayingPlayer  :: `,
      getAllPlayingPlayer
    );
    Logger.info(
      tableId,
      `roundDealerSetTimer tableConfig.minPlayer  ::>> `,
      tableConfig.minPlayer
    );

    if (
      TGP.currentPlayerInTable < tableConfig.minPlayer ||
      getAllPlayingPlayer.length <
        tableConfig.minPlayer /*|| !isentryFeeDeductManageData*/
    ) {
      return false;
    }

    Logger.info(
      tableId,
      `Ending firstRoundBootCollect for tableId : ${tableId}`
    );
    return true;
  } catch (error) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} round ${currentRound} funciton firstRoundBootCollect`
    );

    let msg = MESSAGES.ERROR.COMMON_ERROR;
    let nonProdMsg = "";
    let errorCode = 500;

    if (error instanceof Errors.InvalidInput) {
      nonProdMsg = "Invalid Input";
      commonEventEmitter.emit(EVENT.SHOW_POPUP_ROOM_SOCKET_EVENT, {
        tableId: tableId,
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
    }

    throw new Error(`INTERNAL_ERROR_firstRoundBootCollect() ${error}`);
  }
};

export default firstRoundBootCollect;
