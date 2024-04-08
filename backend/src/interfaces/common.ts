export interface ICheckBalance {
  tournamentId: string;
}

export interface IBlockUserCheck {
  tableId: string;
  isNewTableCreated: boolean;
}

export interface IRediusCheckData {
  _id: string;
  gameId: string;
  isGameRadiusLocationOn: boolean;
  LocationRange: string;
  numericId: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAddGameRunningStatus {
  tableId: string;
  tournamentId: string;
  gameId: string;
}

export interface IRoundStart {
  tableId: string;
  currentRound: number;
  // tableGamePlay: defaultTableGamePlayInterface;
}

export interface IMarkCompletedGameStatus {
  tableId: string;
  tournamentId: string;
  gameId: string;
}
