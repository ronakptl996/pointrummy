import Logger from "../logger";
import commonEventEmitter from "../commonEventEmitter";
import { EMPTY, EVENT, EVENT_EMITTER } from "../constants";
import { addClientInRoom, sendEventToClient, sendEventToRoom } from "../socket";
import lockTimerStart from "../scheduler/queues/lockTimerStart.queue";
import { roundTimerExpired } from "../services/round";

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

const gameCountDownEvent = (payload: any) => {
  const { tableId, data } = payload;

  const responseData: IResponseData = {
    eventName: EVENT.GAME_COUNT_DOWN,
    data,
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
};

const lockInPeriodEvent = (payload: any) => {
  const { tableId, data, socket } = payload;
  const responseData: IResponseData = {
    eventName: EVENT.LOCK_IN_PERIOD_SOCKET_EVENT,
    data,
  };

  if (socket) {
    Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
    sendEventToClient(socket, responseData, tableId);
  } else {
    Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
    sendEventToRoom(tableId, responseData);
  }
};

const roundTimerEnd = async (payload: any) => {
  let { timer, jobId, tableId, currentRound } = payload;
  await lockTimerStart({ timer, jobId, tableId, currentRound });
};

commonEventEmitter.on(EVENT.SHOW_POPUP_CLIENT_SOCKET_EVENT, popUpEventClient);

commonEventEmitter.on(EVENT.ADD_PLAYER_IN_TABLE, addPlayerInTable);

commonEventEmitter.on(EVENT.JOIN_TABLE_SOCKET_EVENT, joinTableEvent);

commonEventEmitter.on(EVENT.GAME_COUNT_DOWN, gameCountDownEvent);

commonEventEmitter.on(EVENT.LOCK_IN_PERIOD_SOCKET_EVENT, lockInPeriodEvent);

commonEventEmitter.on(
  EVENT_EMITTER.ROUND_TIMER_START_TIMER_EXPIED,
  roundTimerEnd
);

commonEventEmitter.on(EVENT_EMITTER.LOCK_IN_PERIOD_EXPIRED, roundTimerExpired);
