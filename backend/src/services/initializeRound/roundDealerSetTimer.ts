import Logger from "../../logger";
import config from "../../config";
import { EVENT, MESSAGES, NUMERICAL } from "../../constants";
import { IRoundStart } from "../../interfaces/common";
import { tableConfigCache, tableGamePlayCache } from "../../cache";
import getAllPlayingUser from "../common/getAllPlayingUser";
import Errors from "../../errors";
import dealerSelect from "./dealerSelect";
import { ISetDealer } from "../../interfaces/round";
import { formatSetDealerData } from "../../formatResponseData";
import commonEventEmitter from "../../commonEventEmitter";
import cardDealing from "../cardDealing";
import cardDealingStartTimer from "../../scheduler/queues/cardDealing.queue";

const { CARD_DEALING_TIMER } = config.getConfig();

const roundDealerSetTimer = async (gameData: IRoundStart) => {
  let lock: any;
  const { currentRound, tableId } = gameData;

  try {
    Logger.info(
      tableId,
      `Starting roundDealerSetTimer And toss for tableId : ${tableId} and round : ${currentRound}`
    );

    const [tableGamePlay, tableConfig] = await Promise.all([
      tableGamePlayCache.getTableGamePlay(tableId),
      tableConfigCache.getTableConfig(tableId),
    ]);
    if (!tableGamePlay || !tableConfig) {
      throw Error("Unable to get data at tableGamePlay or tableConfig");
    }

    Logger.info(
      tableId,
      `Starting roundDealerSetTimer tableGamePlay.currentPlayerInTable  :: `,
      tableGamePlay.currentPlayerInTable
    );

    const getAllPlayingPlayer = await getAllPlayingUser(tableGamePlay.seats);

    Logger.info(
      tableId,
      `roundDealerSetTimer getAllPlayingPlayer  :: `,
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

    let DLR: number = NUMERICAL.ZERO;
    DLR = await dealerSelect(tableGamePlay);

    Logger.info(tableId, "DLR :>> ", DLR);
    tableGamePlay.dealerPlayer = DLR;

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    const formatedSetDealerData: ISetDealer = await formatSetDealerData(
      tableId,
      DLR,
      currentRound
    );

    commonEventEmitter.emit(EVENT.SET_DEALER_SOCKET_EVENT, {
      tableId,
      data: formatedSetDealerData,
    });

    Logger.info(
      tableId,
      `Starting cardDealing timer for tableId : ${tableId} and round : ${currentRound}`
    );

    // Card Dealing
    Logger.info(
      tableId,
      `Starting cardDealingTimer for tableId : ${tableId} and round : ${currentRound}`
    );

    await cardDealing(tableId, currentRound);

    Logger.info(
      tableId,
      `Ending cardDealingTimer for tableId : ${tableId} and round : ${currentRound}`
    );

    await cardDealingStartTimer({
      timer: Number(CARD_DEALING_TIMER),
      jobId: `${tableGamePlay.gameType}:cardDealing:${tableId}`,
      tableId,
      currentRound,
    });

    Logger.info(
      tableId,
      `Ending cardDealingTimer for tableId : ${tableId} and round : ${currentRound}`
    );

    return false;
  } catch (error) {
    Logger.error(
      tableId,
      error,
      ` table ${tableId} round ${currentRound} function roundDealerSetTimer`
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

export default roundDealerSetTimer;
