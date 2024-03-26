import { ICards } from "./inputOutputDataFormator";
import { ISeats } from "./signup";

export interface IFormatedJTResponse {
  tableId: string;
  entryFee: number;
  jointTable: Array<any>;
  tableState: string;
  totalRoundTimer: number;
  dealerPlayer: number;
  validDeclaredPlayerSI: number;
  validDeclaredPlayer: string;
  currentTurnSeatIndex: number;
  currentTurn: any;
  totalUserTurnTimer: number;
  userTurnTimer: number;
  totalUserSeconderyTimer: number;
  trumpCard: Array<string>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  finishDeck: Array<string>;
  isSeconderyTimer: boolean;
  isRemainSeconderyTurns: boolean;
}

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

export interface IRejoinResponse {
  tableId: string;
  userId: string;
  seatIndex: number;
  name: string;
  pp: string;
  pts: number;
  cardCount: number;
  cards: Array<ICards>;
  bv: number;
  totalPlayers: number;
  time: number;
  currentTurnUserId: string;
  currentTurnSeatIndex: number;
  DLR: number;
  playersDetail: Array<ISeats>;
  reconnect: boolean;
  trumpCard: Array<string>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  finishDeck: Array<string>;
}

export interface JTResponse {
  si: number;
  userId: string;
  rejoin?: boolean;
  name: string;
  pp: string;
  userState: string;
}
