import Logger from "../logger";
import { ISeats } from "../interfaces/signup";

const findUserFromSeatIndex = async (
  seatIndex: number,
  playersDetail: Array<ISeats>,
  tableId: string
): Promise<string> => {
  try {
    const playerData = playersDetail.filter(
      (player) => player.si === seatIndex
    );
    return playerData[0].userId;
  } catch (error) {
    Logger.error(tableId, `Error in findUserFromSeatIndex`, error);
    throw new Error(`Error in findUserFromSeatIndex`);
  }
};

export default findUserFromSeatIndex;
