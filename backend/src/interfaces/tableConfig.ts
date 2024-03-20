import { ISeats } from "./signup";

export interface INewGTIResponse {
  tableId: string;
  seatIndex: number;
  gameType: string;
  entryFee: string;
  maximumSeat: number;
  minimumSeat: number;
  activePlayers: number;
  gameStartTimer: number;
  turnTimer: number;
  tableState: string;
  turnCount: number;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  dealerPlayer: number;
  declareingPlayer: string;
  validDeclaredPlayer: string;
  validDeclaredPlayerSI: number;
  playersDetail: Array<ISeats>;
  reconnect?: boolean;
}

export interface IDefaultTableConfig {
  _id: string;
  gameType: string;
  currentRound: number;
  lobbyId: string;
  gameId: string;
  multiWinner: boolean;
  maximumPoints: number;
  minPlayer: number;
  noOfPlayer: number;
  gameStartTimer: number;
  userTurnTimer: number;
  secondaryTimer: number;
  declareTimer: number;
  entryFee: number;
  moneyMode: string;
  numberOfDeck: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITableQueue {
  tableId: Array<string>;
}
