import Logger from "../logger";
import commonEventEmitter from "../commonEventEmitter";
import { EMPTY, EVENT, EVENT_EMITTER } from "../constants";
import { addClientInRoom, sendEventToClient, sendEventToRoom } from "../socket";
import lockTimerStart from "../scheduler/queues/lockTimerStart.queue";
import { roundTimerExpired } from "../services/round";
import {
  cardDealingTimer,
  roundDealerSetTimer,
  tossCardTimer,
} from "../services/initializeRound";
import { changeTurn, secondaryTimer } from "../services/turn";
import onTurnExpire from "../services/turn/turnExpire";

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

const tossCardEvent = async (payload: any) => {
  const { tableId, socket, data } = payload;
  const responseData: IResponseData = {
    eventName: EVENT.TOSS_CARD_SOCKET_EVENT,
    data,
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
};

const dealerPlayerEvent = (payload: any) => {
  const { tableId, data } = payload;
  const responseData: IResponseData = {
    eventName: EVENT.SET_DEALER_SOCKET_EVENT,
    data,
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
};

const provideCardEvent = (payload: any) => {
  const { socket, data, tableId } = payload;
  const responseData: IResponseData = {
    eventName: EVENT.PROVIDED_CARDS_EVENT,
    data,
  };
  Logger.debug(tableId, "SEND EVENT TO CLIENT :: ", responseData);
  sendEventToClient(socket, responseData, tableId);
};

const startUserTurnSocket = (payload: any) => {
  const { tableId, data } = payload;
  const responseData: IResponseData = {
    eventName: EVENT.USER_TURN_STARTED_SOCKET_EVENT,
    data,
  };
  Logger.debug(tableId, "SEND EVENT TO TABLE :: ", responseData);
  sendEventToRoom(tableId, responseData);
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

commonEventEmitter.on(
  EVENT_EMITTER.BOOT_COLLECTING_START_TIMER_EXPIRED,
  tossCardTimer
);

commonEventEmitter.on(EVENT.TOSS_CARD_SOCKET_EVENT, tossCardEvent);

commonEventEmitter.on(EVENT_EMITTER.TOSS_CARD_EXPIRED, roundDealerSetTimer);

commonEventEmitter.on(EVENT.SET_DEALER_SOCKET_EVENT, dealerPlayerEvent);

commonEventEmitter.on(EVENT.PROVIDED_CARDS_EVENT, provideCardEvent);

commonEventEmitter.on(
  EVENT_EMITTER.CARD_DEALING_TIMER_EXPIRED,
  cardDealingTimer
);

commonEventEmitter.on(
  EVENT.USER_TURN_STARTED_SOCKET_EVENT,
  startUserTurnSocket
);

commonEventEmitter.on(EVENT_EMITTER.PLAYER_TURN_TIMER_EXPIRED, secondaryTimer);

commonEventEmitter.on(EVENT_EMITTER.EXPIRE_SECONDERY_TIMER, onTurnExpire);

// commonEventEmitter.on(EVENT.EXPIRE_SCORE_BOARD_TIMER, )
commonEventEmitter.on(EVENT_EMITTER.NEXT_TURN_DELAY, (res) => {
  changeTurn(res.tableId);
});
