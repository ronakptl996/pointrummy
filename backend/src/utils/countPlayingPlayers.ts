import Logger from "../logger";
import { NUMERICAL, PLAYER_STATE } from "../constants";
import { IDefaultTableGamePlay } from "../interfaces/tableGamePlay";

const countPlayingPlayers = async (
  tableGamePlay: IDefaultTableGamePlay,
  tableId: string
) => {
  try {
    let count: number = NUMERICAL.ONE;
    for (const seat of tableGamePlay.seats) {
      if (seat.userState === PLAYER_STATE.PLAYING) {
        count += 1;
      }
    }
    return count;
  } catch (error) {
    Logger.info(tableId, "---- countPlayingPlayers :: ERROR: " + error);
    throw error;
  }
};

export default countPlayingPlayers;
