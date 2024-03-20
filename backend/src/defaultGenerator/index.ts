import config from "../config";
import { ObjectId } from "mongodb";
import { GetRandomInt } from "../common";
import { EMPTY, NUMERICAL, PLAYER_STATE, TABLE_STATE } from "../constants";
import {
  IUserProfileDataInput,
  IUserProfileOutput,
} from "../interfaces/userProfile";
import { ICreateTable } from "../interfaces/signup";
import { IDefaultTableConfig } from "../interfaces/tableConfig";
import { IDefaultTableGamePlay } from "../interfaces/tableGamePlay";
import { IDefaultPlayerGamePlay } from "../interfaces/playerGamePlay";

const { GAME_START_TIMER, USER_TURN_TIMER, SECONDARY_TIMER, DECLARE_TIMER } =
  config.getConfig();

const defaultUserProfile = (userData: any): IUserProfileOutput => {
  const currentTimeStamp = new Date().toString();
  return {
    id: userData.userId
      ? userData.userId.toString()
      : new ObjectId().toString(),
    username: !userData.username
      ? `Guest${GetRandomInt(1, 99999999)}`
      : userData.username,
    userId: userData.userId
      ? userData.userId.toString()
      : new ObjectId().toString(),
    profilePic: userData.profilePic,
    tableId: EMPTY,
    tableIds: [],
    socketId: userData.socketId,
    noOfPlayer: userData.noOfPlayer,
    isUseBot: userData.isUseBot || false,
    isFTUE: userData.isFTUE || false,
    gameId: userData.gameId,
    isRobot: false,
    lobbyId: userData.lobbyId,
    entryFee: Number(userData.entryFee),
    createdAt: currentTimeStamp,
    updatedAt: currentTimeStamp,
    authToken: userData.authToken,
    isAnyRunningGame: userData.isAnyRunningGame,
    longitude: userData.longitude || "0",
    latitude: userData.latitude || "0",
    balance: userData.balance,
    oldTableId: [],
    gameType: userData.gameType,
  };
};

const defaultTableData = (signUpData: ICreateTable): IDefaultTableConfig => {
  const currentTimeStamp = new Date();
  return {
    _id: new ObjectId().toString(),
    gameType: signUpData.gameType,
    currentRound: NUMERICAL.ONE,
    lobbyId: signUpData.lobbyId,
    gameId: signUpData.gameId,
    multiWinner: false,
    maximumPoints: NUMERICAL.EIGHTY,
    minPlayer: signUpData.minPlayer || NUMERICAL.TWO,
    noOfPlayer: signUpData.noOfPlayer,
    gameStartTimer: Number(GAME_START_TIMER),
    userTurnTimer: Number(USER_TURN_TIMER),
    secondaryTimer: Number(SECONDARY_TIMER),
    declareTimer: Number(DECLARE_TIMER),
    entryFee: signUpData.entryFee,
    moneyMode: signUpData.moneyMode,
    numberOfDeck: NUMERICAL.TWO,
    createdAt: currentTimeStamp.toString(),
    updatedAt: currentTimeStamp.toString(),
  };
};

const defaultTableGamePlayData = (gameType: string): IDefaultTableGamePlay => {
  const currentTimeStamp = new Date();

  return {
    _id: new ObjectId().toString(),
    trumpCard: [],
    closedDeck: [],
    opendDeck: [],
    finishDeck: [],
    turnCount: NUMERICAL.ZERO,
    tossWinPlayer: NUMERICAL.MINUS_ONE,
    dealerPlayer: NUMERICAL.MINUS_ONE,
    declareingPlayer: EMPTY,
    validDeclaredPlayer: EMPTY,
    validDeclaredPlayerSI: NUMERICAL.ZERO,
    finishCount: [],
    isTurn: false,
    isnextRound: false,
    discardedCardsObj: [],
    potValue: NUMERICAL.ZERO,
    currentTurn: EMPTY,
    totalPickCount: NUMERICAL.ZERO,
    currentTurnSeatIndex: NUMERICAL.MINUS_ONE,
    currentPlayerInTable: NUMERICAL.ZERO,
    tableState: TABLE_STATE.WAITING_FOR_PLAYERS,
    seats: [],
    tableCurrentTimer: NUMERICAL.ZERO,
    gameType: gameType,
    isSeconderyTimer: false,
    createdAt: currentTimeStamp.toString(),
    updatedAt: currentTimeStamp.toString(),
  };
};

const defaultPlayerGamePlayData = (
  userId: string,
  seatIndex: number,
  username: string,
  profilePic: string,
  userStatus: string
): IDefaultPlayerGamePlay => {
  const currentTimeStamp = new Date();
  return {
    _id: new ObjectId().toString(),
    userId,
    username,
    profilePic,
    seatIndex,
    userStatus: userStatus ? userStatus : PLAYER_STATE.WATCHING,
    playingStatus: EMPTY,
    tCount: NUMERICAL.ZERO,
    cardPoints: NUMERICAL.ZERO,
    lastPickCard: EMPTY,
    pickFromDeck: EMPTY,
    currentCards: [],
    groupingCards: {
      pure: [],
      impure: [],
      set: [],
      dwd: [],
    },
    turnTimeOut: NUMERICAL.ZERO,
    seconderyTimerCounts: NUMERICAL.ZERO,
    winningCash: NUMERICAL.ZERO,
    looseingCash: NUMERICAL.ZERO,
    isDropAndMove: false,
    dropScore: NUMERICAL.MINUS_ONE,
    createdAt: currentTimeStamp.toString(),
    updatedAt: currentTimeStamp.toString(),
    ispickCard: false,
  };
};

export {
  defaultUserProfile,
  defaultTableData,
  defaultTableGamePlayData,
  defaultPlayerGamePlayData,
};
