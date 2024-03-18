export interface IGetUserInput {
  _id: string;
}

export interface IUserProfileDataInput {
  socketId: string;
  userId: string;
  username: string;
  lobbyId: string;
  gameId: string;
  entryFee: number;
  profilePic: string;
}

export interface IUserProfileOutput {
  id: string;
  username: string;
  userId: string;
  profilePic: string;
  socketId: string;
  tableId: string;
  tableIds: Array<string>;
  gameId: string;
  lobbyId: string;
  entryFee: number;
  noOfPlayer: number;
  isUseBot: boolean;
  isFTUE: boolean;
  isPlay?: boolean;
  isRobot: boolean;
  createdAt: string;
  updatedAt: string;
  oldTableId: Array<string>;
  authToken: string;
  isAnyRunningGame: boolean;
  latitude: string;
  longitude: string;
  balance: number;
  gameType: string;
}
