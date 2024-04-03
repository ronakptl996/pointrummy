import Logger from "../../../logger";
import commonEventEmitter from "../../../commonEventEmitter";
import { IDefaultPlayerGamePlay } from "../../../interfaces/playerGamePlay";
import { IUserProfileOutput } from "../../../interfaces/userProfile";
import { leaveClientInRoom } from "../../../socket";
import { decrCounterLobbyWise } from "../../../cache/onlinePlayer";
import { REDIS } from "../../../constants";

const emitLeaveTableEvent = async (
  tableId: string,
  playerGamePlay: IDefaultPlayerGamePlay,
  userProfile: IUserProfileOutput,
  message: string,
  updatedUserCount: number,
  tableState: string,
  isLeaveEventSend: boolean,
  socketId: string
) => {
  try {
    Logger.info(
      tableId,
      "isLeaveEventSend  :: >> ",
      isLeaveEventSend,
      "tableState :: ",
      tableState
    );
    if (!isLeaveEventSend) {
      await leaveClientInRoom(socketId, tableId);
    }

    // lobby wise user decrement count
    Logger.info("leaveTable :: decrCounterLobbyWise :: Call");
    await decrCounterLobbyWise(REDIS.ONLINE_PLAYER_LOBBY, userProfile.lobbyId);

    // IMP
  } catch (error) {}
};
