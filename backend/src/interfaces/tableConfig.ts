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
