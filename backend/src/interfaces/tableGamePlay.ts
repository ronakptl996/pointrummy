import { ISeats } from "./signup";

export interface IDefaultBaseTable {
  tableState: string;
  seats: Array<ISeats>;
}

export interface IDiscardedCardsObj {
  userId: string;
  card: string;
  seatIndex: number;
}

export interface IDefaultTableGamePlay {
  _id: string;
  trumpCard: Array<string>;
  closedDeck: Array<string>;
  opendDeck: Array<string>;
  finishDeck: Array<string>;
  turnCount: number;
  tossWinPlayer: number;
  dealerPlayer: number;
  declareingPlayer: string;
  validDeclaredPlayer: string;
  validDeclaredPlayerSI: number;
  finishCount: Array<string>;
  isTurn: boolean;
  isnextRound: boolean;
  discardedCardsObj: Array<IDiscardedCardsObj>;
  potValue: number;
  currentTurn: string;
  totalPickCount: number;
  currentPlayerInTable: number;
  currentTurnSeatIndex: number;
  tableState: string;
  seats: Array<ISeats>;
  tableCurrentTimer: any;
  gameType: string;
  isSeconderyTimer: boolean;
  createdAt: string;
  updatedAt: string;
}
