import { ObjectId } from "mongodb";
import {
  IUserProfileDataInput,
  IUserProfileOutput,
} from "../interfaces/userProfile";
import { GetRandomInt } from "../common";
import { EMPTY } from "../constants";

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

export { defaultUserProfile };
