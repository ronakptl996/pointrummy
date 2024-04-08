import Logger from "../../../logger";
import commonEventEmitter from "../../../commonEventEmitter";
import { IDefaultPlayerGamePlay } from "../../../interfaces/playerGamePlay";
import { IUserProfileOutput } from "../../../interfaces/userProfile";
import { leaveClientInRoom } from "../../../socket";
import { decrCounterLobbyWise } from "../../../cache/onlinePlayer";
import { EVENT, REDIS } from "../../../constants";
import { ILeaveTableRes } from "../../../interfaces/inputOutputDataFormator";
import { formatLeaveTableData } from "../../../formatResponseData";

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

    const formatRemoveUserResponse: ILeaveTableRes = await formatLeaveTableData(
      tableId,
      playerGamePlay,
      message,
      updatedUserCount,
      tableState
    );

    Logger.info(
      tableId,
      " formatRemoveUserResponse :: ",
      formatRemoveUserResponse
    );

    commonEventEmitter.emit(EVENT.LEAVE_TABLE_SOCKET_EVENT, {
      tableId: tableId,
      data: formatRemoveUserResponse,
      socketId: userProfile.socketId,
    });

    return true;
  } catch (error) {
    Logger.error(tableId, `emitLeaveTableEvent Error :: ${error}`);
    Logger.info(
      tableId,
      "<<======= emitLeaveTableEvent() Error ======>>",
      error
    );
  }
};

export default emitLeaveTableEvent;
