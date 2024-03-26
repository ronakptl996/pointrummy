import Logger from "../../logger";
import { ISeats } from "../../interfaces/signup";
import { IDefaultTableGamePlay } from "../../interfaces/tableGamePlay";
import { userProfile } from "../../utils";

const findTotalPlayersCount = async (
  tableGamePlay: IDefaultTableGamePlay,
  tableId: string
) => {
  try {
    const filteredSeats = tableGamePlay.seats.filter(
      (seat: ISeats) => seat.userId
    );

    const playerInfoPromise = filteredSeats.map((seat: ISeats) =>
      userProfile.getUser({ _id: seat.userId })
    );

    const totalPlayers = await Promise.all(playerInfoPromise);
    const totalPlayersCount = totalPlayers.length;

    return totalPlayersCount;
  } catch (error: any) {
    Logger.error(tableId, error, "function findTotalPlayersCount");
    throw new Error(error);
  }
};

export default findTotalPlayersCount;
