import Logger from "../logger";
import commonEventEmitter from "../commonEventEmitter";
import { EMPTY, EVENT } from "../constants";
import { addClientInRoom, sendEventToClient, sendEventToRoom } from "../socket";

interface IResponseData {
  eventName: string;
  data: any;
}

const popUpEventClient = (payload: any) => {
  const { socket, data } = payload;
  let tableId = EMPTY;
  const responseData: IResponseData = {
    eventName: EVENT.SHOW_POPUP_SOCKET_EVENT,
    data,
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
};

const addPlayerInTable = async (payload: any) => {
  const { socketId, data } = payload;
  const { tableId, userId } = data;

  await addClientInRoom(socketId, tableId, userId);
};

const joinTableEvent = (payload: any) => {
  const { tableId, data } = payload;
  const responseData: IResponseData = {
    eventName: EVENT.JOIN_TABLE_SOCKET_EVENT,
    data,
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
};

commonEventEmitter.on(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, popUpEventClient);

commonEventEmitter.on(EVENT.ADD_PLAYER_IN_TABLE, addPlayerInTable);

commonEventEmitter.on(EVENT.JOIN_TABLE_SOCKET_EVENT, joinTableEvent);
