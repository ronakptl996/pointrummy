import { ISeats } from "./signup";

export interface IDiscardedCardsObjInterface {
  userId: string;
  card: string;
  seatIndex: number;
}

export interface IDefaultTableGamePlayInterface {
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
  discardedCardsObj: Array<IDiscardedCardsObjInterface>;
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
