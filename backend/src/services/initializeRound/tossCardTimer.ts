import Logger from "../../logger";
import Errors from "../../errors";
import commonEventEmitter from "../../commonEventEmitter";
import getAllPlayingUser from "../common/getAllPlayingUser";
import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { IRoundStart } from "../../interfaces/common";
import tossCards from "../toss";
import { countPlayingPlayers } from "../../utils";
import { EVENT, MESSAGES, NUMERICAL } from "../../constants";
import tossCardStartTimer from "../../scheduler/queues/tossCardStart.queue";

const tossCardTimer = async (gameData: IRoundStart) => {
  const { currentRound, tableId } = gameData;

  try {
    Logger.info(
      tableId,
      `Starting tossCardTimertableId : ${tableId} and round : ${currentRound}`
    );

    const tableConfig = await tableConfigCache.getTableConfig(tableId);
    if (!tableConfig) {
      throw Error("Unable to get data tableConfig");
    }

    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!tableGamePlay) {
      throw Error("Unable to get data tableGamePlay");
    }

    const getAllPlayingPlayer = await getAllPlayingUser(tableGamePlay.seats);
    Logger.info(
      tableId,
      `tossCardTimertableId getAllPlayingPlayer  :: `,
      getAllPlayingPlayer
    );

    if (
      tableGamePlay.currentPlayerInTable < tableConfig.minPlayer ||
      getAllPlayingPlayer.length < tableConfig.minPlayer
    ) {
      throw new Errors.InvalidInput(
        "currentPlayerInTable is not more than two players"
      );
    }

    await tossCards(tableId);

    const totalPlayingPlayerCount = await countPlayingPlayers(
      tableGamePlay,
      tableId
    );

    const tossTimer = Number(
      totalPlayingPlayerCount * 1.4 * NUMERICAL.THOUSAND
    );
    Logger.info(tableId, "toss timer :: ", tossTimer);

    await tossCardStartTimer({
      timer: tossTimer,
      jobId: `${tableGamePlay.gameType}:tossCard:${tableId}`,
      tableId,
      currentRound,
    });

    Logger.info(
      tableId,
      `Ending tossCardTimer for tableId : ${tableId} and round : ${currentRound}`
    );
    return true;
  } catch (error) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} round ${currentRound} function tossCardTimer`
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

    Logger.info(tableId, "ERROR ===>>", error);

    throw error;
  }
};

export default tossCardTimer;
