import { ISeats } from "../../interfaces/signup";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";

const getPlayingUserInRound = async (tableGamePlay: IDefaultTableGamePlay) => {
  const activePlayersData: ISeats[] = [];
  for await (const seat of tableGamePlay.seats) {
    activePlayersData.push(seat);
  }

  return activePlayersData;
};

export default getPlayingUserInRound;
