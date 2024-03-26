export interface ISignUpInput {
  accessToken: string;
  minPlayer: number;
  noOfPlayer: number;
  lobbyId: string;
  isUseBot: boolean;
  entryFee: string;
  moneyMode: string;
  totalRound: number;
  userName: string;
  userId: string;
  profilePic: string;
  gameId: string;
  rummyType: string;
  isFTUE: boolean;
  gameModeId: string;
  signUpType?: string;
  latitude: string;
  longitude: string;
}

export interface ISeats {
  userId: string;
  si: number;
  name: string;
  rejoin?: boolean;
  pp: string;
  userState: string;
}

export interface IFindUser {
  socketId: string;
  userId: string;
  username: string;
  lobbyId: string;
  gameId: string;
  profilePic: string;
  entryFee: number;
  noOfPlayer: number;
  isUseBot: boolean;
  isFTUE: boolean;
  authToken: string;
  isAnyRunningGame: boolean;
  gameType: string;
  latitude: string;
  longitude: string;
}

export interface ICreateTable {
  socketId: string;
  userId: string;
  username: string;
  profilePic: string;
  entryFee: number;
  gameId: string;
  lobbyId: string;
  noOfPlayer: number;
  minPlayer: number;
  moneyMode: string;
  gameType: string;
  latitude: string;
  longitude: string;
  authToken: string;
  isUseBot: boolean;
}

export interface ISignupResponse {
  _id: string;
  un: string;
  pp: string;
  // isRejoin: boolean;
  socketid: string;
  tableId: string;
  gameId: string;
  lobbyId: string;
  chips: string;
  isPlay?: boolean;
  isRobot: boolean;
  latitude: string;
  longitude: string;
  entryFee: string;
  maximumSeat: number;
  maxTableCreateLimit: number;
}

interface IErrorObj {
  errorCode: number;
  errorMessage: string;
}

export interface IErrorRes {
  success: boolean;
  error: IErrorObj | null;
}
