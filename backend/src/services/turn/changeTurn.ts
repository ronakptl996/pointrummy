import Logger from "../../logger";
import config from "../../config";
import Lock from "../../lock";
import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { EVENT_EMITTER, TABLE_STATE } from "../../constants";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import { ISeats } from "../../interfaces/signup";
import getPlayingUserInRound from "../common/getPlayingUser";
import { getNextPlayer, getPreviousPlayer } from "./helper";
import commonEventEmitter from "../../commonEventEmitter";

const changeTurn = async (tableId: string) => {
  const { IS_CLOCKWISE_TURN } = config.getConfig();
  const lock = await Lock.getLock().acquire([tableId], 2000);
  try {
    Logger.info("tableTurn ", tableId);
    Logger.info(tableId, `Starting changeTurn for tableId : ${tableId}`);

    const [tableConfig, tableGamePlay] = await Promise.all([
      tableConfigCache.getTableConfig(tableId),
      tableGamePlayCache.getTableGamePlay(tableId),
    ]);
    if (!tableConfig) {
      throw new Error("Unable to get table config");
    }
    if (!tableGamePlay) {
      throw new Error("Unable to get table game play");
    }

    Logger.info(tableId, `changeTurn  :: tableGamePlay  :: >>`, tableGamePlay);

    if (
      tableGamePlay.tableState === TABLE_STATE.WINNER_DECLARED ||
      tableGamePlay.tableState === TABLE_STATE.SCORE_BOARD
    ) {
      return true;
    }

    const tableGamePlayInfo: IDefaultTableGamePlay = JSON.parse(
      JSON.stringify(tableGamePlay)
    );
    const activePlayerData: ISeats[] = await getPlayingUserInRound(
      tableGamePlay
    );

    // Change Turn User
    let nextPlayer: ISeats = {} as ISeats;
    if (IS_CLOCKWISE_TURN) {
      nextPlayer = getNextPlayer(
        activePlayerData,
        tableGamePlay.currentTurn,
        tableId
      );
    } else {
      Logger.info(tableId, " changeTurn :: priviuosPlayer :: ", nextPlayer);
      nextPlayer = await getPreviousPlayer(
        activePlayerData,
        tableGamePlay.currentTurn,
        tableId
      );

      Logger.info(tableId, "changeTurn :: nextPlayer :: ", nextPlayer);
    }

    Logger.info(tableId, "changeTurn ::: nextPlayer :: ", nextPlayer);

    tableGamePlayInfo.currentTurn = nextPlayer.userId;
    tableGamePlayInfo.currentTurnSeatIndex = nextPlayer.si;
    tableGamePlayInfo.updatedAt = new Date().toString();

    await tableGamePlayCache.insertTableGamePlay(tableGamePlayInfo, tableId);

    Logger.info(
      tableId,
      " changeTurn :: nextPlayer :: tableGamePlay.currentTurn ::> ",
      tableGamePlayInfo.currentTurn
    );
    Logger.info(
      tableId,
      " changeTurn :: nextPlayer :: tableGamePlay.currentTurnSeatIndex ::> ",
      tableGamePlayInfo.currentTurnSeatIndex
    );

    commonEventEmitter.emit(EVENT_EMITTER.START_USER_TURN, {
      tableId,
      userId: nextPlayer.userId,
      seatIndex: nextPlayer.si,
      currentTurnSeatIndex: tableGamePlayInfo.currentTurnSeatIndex,
      tableGamePlay: tableGamePlayInfo,
    });

    Logger.info(tableId, `Ending changeTurn for tableId : ${tableId}`);
    return true;
  } catch (error) {
    Logger.error(tableId, error, ` table ${tableId} function changeTurn`);
    throw new Error(`INTERNAL_ERROR_changeTurn() =====>> Error=${error}`);
  } finally {
    try {
      if (lock) await Lock.getLock().release(lock);
    } catch (error) {
      Logger.error(tableId, error, " leaveTable ");
    }
  }
};

export default changeTurn;
