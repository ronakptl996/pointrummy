import Logger from "../../../logger";
import { NUMERICAL, PLAYER_STATE } from "../../../constants";
import { ISeats } from "../../../interfaces/signup";

const getNextPlayer = (
  activePlayerData: ISeats[],
  currentTurn: string,
  tableId: string
) => {
  let currentIndex: number = NUMERICAL.ZERO;
  activePlayerData.map((ele, ind) => {
    if (ele.userId == currentTurn) {
      currentIndex = ind;
    }
  });

  Logger.info(tableId, " current turn seatIndex :: ", currentIndex);

  let nextPlayer: ISeats[] = [];

  if (currentIndex == activePlayerData.length - NUMERICAL.ONE) {
    for (let i = 0; i < activePlayerData.length; i++) {
      const element = activePlayerData[i];
      if (element.userState == PLAYER_STATE.PLAYING) {
        nextPlayer.push(element);
        break;
      }
    }
  } else {
    for (
      let i = currentIndex + NUMERICAL.ONE;
      i < activePlayerData.length;
      i++
    ) {
      const element = activePlayerData[i];
      if (element.userState == PLAYER_STATE.PLAYING) {
        nextPlayer.push(element);
        break;
      } else {
        if (i + NUMERICAL.ONE == activePlayerData.length) {
          i = NUMERICAL.MINUS_ONE;
        }
        for (let j = i + NUMERICAL.ONE; j < activePlayerData.length; j++) {
          const element = activePlayerData[j];
          if (element.userState == PLAYER_STATE.PLAYING) {
            nextPlayer.push(element);
            break;
          }
        }
      }
    }
  }

  Logger.info(
    tableId,
    "nextPlayer turn :: seatIndex :  ",
    nextPlayer[0].si,
    "nextPlayer",
    nextPlayer
  );
  return nextPlayer[0];
};

export default getNextPlayer;
