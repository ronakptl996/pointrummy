import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import config from "../../config";
import {
  playerGamePlayCache,
  tableConfigCache,
  tableGamePlayCache,
} from "../../cache";
import {
  EVENT,
  MESSAGES,
  NUMERICAL,
  TABLE_STATE,
  EVENT_EMITTER,
} from "../../constants";
import getCards from "../../utils/getCards";

const { LOCK_IN_TIMER } = config.getConfig();

const roundTimerStartProcess = async (job: any) => {
  let tableId = job.data.tableId;
  try {
    Logger.info(tableId, "roundTimerStartProcess : tableId", tableId);

    const [tableGamePlay, tableConfig] = await Promise.all([
      await tableGamePlayCache.getTableGamePlay(tableId),
      await tableConfigCache.getTableConfig(tableId),
    ]);

    if (!tableGamePlay) {
      throw Error("Unable to get data");
    }
    if (!tableConfig) throw new Error("Unable to get table config");

    Logger.info(
      tableId,
      " roundTimerStartProcess :: tableGamePlay :: >> ",
      tableGamePlay
    );
    Logger.info(
      tableId,
      " roundTimerStartProcess  ::  tableConfig  :: >> ",
      tableConfig
    );

    if (tableGamePlay.currentPlayerInTable < tableConfig.minPlayer) {
      return false;
    }

    tableGamePlay.tableState = TABLE_STATE.LOCK_IN_PERIOD;
    tableGamePlay.updatedAt = new Date().toString();

    commonEventEmitter.emit(EVENT.LOCK_IN_PERIOD_SOCKET_EVENT, {
      tableId,
      data: {
        tableId,
        currentRound: NUMERICAL.ONE,
        msg: MESSAGES.ERROR.LOCK_IN_PEROID_MSG,
      },
    });

    Logger.info(
      tableId,
      " <<== LOCK_IN_PERIOD_SOCKET_EVENT ==>> LOCK_IN_TIMER : ",
      LOCK_IN_TIMER
    );

    // Distribute Card
    const totalActivePlayer = tableGamePlay.seats.length;
    const userCards = await getCards(tableId, NUMERICAL.ONE, totalActivePlayer);

    Logger.info(tableId, "  userCards  ==>> ", userCards);

    tableGamePlay.closedDeck = userCards.closedDeck;
    tableGamePlay.opendDeck = userCards.opendDeck;
    tableGamePlay.trumpCard = userCards.trumpCard;

    Logger.info(
      tableId,
      "tableGamePlay  card distribution  ::>>",
      tableGamePlay
    );

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const playerGamePlay = await playerGamePlayCache.getPlayerGamePlay(
        tableGamePlay.seats[i].userId.toString(),
        tableId
      );
      if (!playerGamePlay) throw Error("Unable to get data card dealing");

      playerGamePlay.currentCards = [userCards.cardAndPoint[i].card];
      playerGamePlay.cardPoints = userCards.cardAndPoint[i].points;
      playerGamePlay.groupingCards.dwd.push(userCards.cardAndPoint[i].card);

      await playerGamePlayCache.insertPlayerGamePlay(playerGamePlay, tableId);
      Logger.info(
        tableId,
        playerGamePlay.userStatus,
        " playerGamePlay.userStatus"
      );
    }

    const jobId = `lockTimerStart:${tableId}`;
    const lockTime = Number(LOCK_IN_TIMER);

    const lockJob = {
      data: {
        timer: lockTime - Number(NUMERICAL.FIVE_HUNDRED),
        jobId,
        tableId,
        currentRound: NUMERICAL.ONE,
      },
    };

    commonEventEmitter.emit(
      EVENT_EMITTER.ROUND_TIMER_START_TIMER_EXPIED,
      lockJob.data
    );

    return job.data;
  } catch (error) {
    Logger.error(tableId, "roundTimerStartProcess ERROR : ", error);
    return undefined;
  }
};

export default roundTimerStartProcess;
