import { PLAYER_STATE } from "../../constants";
import { ISeats } from "../../interfaces/signup";

const getAllPlayingUser = (seats: ISeats[]): ISeats[] => {
  const playerData: ISeats[] = seats.filter(
    (player) => player.userState === PLAYER_STATE.PLAYING
  );

  return playerData;
};

export default getAllPlayingUser;
