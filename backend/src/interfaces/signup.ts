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
