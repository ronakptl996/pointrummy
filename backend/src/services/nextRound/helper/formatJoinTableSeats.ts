import Logger from "../../../logger";
import { NUMERICAL, PLAYER_STATE } from "../../../constants";

const formatJoinTableSeats = (
  remainUsersSeats: any,
  maxSeats: number,
  tableId: string
) => {
  try {
    let seats: any = [];
    for (let i = 0; i < maxSeats; i++) {
      const seatsUser = remainUsersSeats.filter((user: any) => user.si === i);
      Logger.info(tableId, "formatJoinTableSeats :: seatsUser :>>", seatsUser);

      if (seatsUser.length == NUMERICAL.ONE) {
        seats.push(seatsUser[NUMERICAL.ZERO]);
      } else {
        const obj = {
          si: i,
          userId: "",
          name: "",
          pp: "",
          userState: PLAYER_STATE.PLAYING,
        };
        seats.push(obj);
      }
    }
    return seats;
  } catch (error) {
    Logger.error(tableId, "--- formatJoinTableSeats :: ERROR :: ", error);
  }
};

export default formatJoinTableSeats;
