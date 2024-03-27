import Logger from "../../logger";
import Errors from "../../errors";
import commonEventEmitter from "../../commonEventEmitter";
import getAllPlayingUser from "../common/getAllPlayingUser";
import { tableConfigCache, tableGamePlayCache } from "../../cache";
import { IRoundStart } from "../../interfaces/common";
import tossCards from "../toss";

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
  } catch (error) {}
};
