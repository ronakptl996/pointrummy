import Logger from "../../logger";
import config from "../../config";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import { ISeats } from "../../interfaces/signup";
import { NUMERICAL, PLAYER_STATE } from "../../constants";

const dealerSelect = async (tableGamePlay: IDefaultTableGamePlay) => {
  const { IS_CLOCKWISE_TURN } = config.getConfig();
  try {
    if (IS_CLOCKWISE_TURN) {
      let playingPlayers: ISeats[] = [];
      let index: number = NUMERICAL.ZERO;
      let count = NUMERICAL.ZERO;
      tableGamePlay.seats.map((player, ind) => {
        if (player.userState === PLAYER_STATE.PLAYING) {
          playingPlayers.push(player);
        }
      });

      for (const player of playingPlayers) {
        if (player.si === tableGamePlay.tossWinPlayer) {
          index = count;
        }
        count += NUMERICAL.ONE;
      }

      let nextIndex = (index - 1) % playingPlayers.length;
      if (nextIndex === NUMERICAL.MINUS_ONE) {
        nextIndex = playingPlayers.length - NUMERICAL.ONE;
      }
      return playingPlayers[nextIndex].si;
    } else {
      let playingPlayers: ISeats[] = [];
      let index: number = NUMERICAL.ZERO;
      let count = NUMERICAL.ZERO;
      tableGamePlay.seats.map((player) => {
        if (player.userState === PLAYER_STATE.PLAYING) {
          playingPlayers.push(player);
        }
      });

      for (const player of playingPlayers) {
        if (player.si === tableGamePlay.tossWinPlayer) {
          index = count;
        }
        count += NUMERICAL.ONE;
      }

      let nextIndex = (index + 1) % playingPlayers.length;
      return playingPlayers[nextIndex].si;
    }
  } catch (error) {
    Logger.error("--- dealerSelect :: ERROR :: ", error);
    throw error;
  }
};

export default dealerSelect;
