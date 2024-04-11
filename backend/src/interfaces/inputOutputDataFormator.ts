export interface ICards {
  group: Array<string>;
  groupType: string;
  cardPoints: number;
}

// Leave table Data in Request and Response
export interface ILeaveTableInput {
  userId: string;
  tableId: string;
  currentRound: number;
  isLeaveFromScoreBoard: boolean;
}

export interface IPickCardFromCloseDackInput {
  userId: string;
  tableId: string;
  currentRound: number;
}

export interface IPickCardFormCloseDackResponse {
  userId: string;
  si: number;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
  msg: string;
  pickUpCard: string;
}

export interface IPickCardFormOpenDackInput {
  userId: string;
  tableId: string;
  currentRound: number;
}

export interface IPickCardFormOpenDackRes {
  userId: string;
  si: number;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
  msg: string;
  pickUpCard: string;
}

export interface ILeaveTableRes {
  userId: string;
  tableId: string;
  currentRound: number;
  name: string;
  si: number;
  pp: string;
  message: string;
  updatedUserCount: number;
  tableState: string;
}

// Discardcard Request & Response
export interface IDiscardCardRes {
  userId: string;
  si: number;
  tableId: string;
  cards: Array<ICards>;
  totalScorePoint: number;
  opendDeck: Array<string>;
}

// Resuffal Data
export interface IResuffalDataRes {
  closedDeck: Array<string>;
  openDeck: Array<string>;
  tableId: string;
}
