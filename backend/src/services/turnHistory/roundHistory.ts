import { IGameDetails } from "../../interfaces/turnHistory";

const getCurrentRoundHistory = (
  history: Array<IGameDetails>,
  currentRound: number
): IGameDetails => {
  return history.filter((e: IGameDetails) => e.roundNo === currentRound)[0];
};

const replaceRoundHistory = (
  history: Array<IGameDetails>,
  currentRound: number,
  updatedObj: IGameDetails
): Array<IGameDetails> => {
  const newHistory: Array<IGameDetails> = history;
  const foundIndex: number = history.findIndex(
    (e: IGameDetails) => e.roundNo === currentRound
  );

  newHistory[foundIndex] = updatedObj;
  return newHistory;
};

export default { getCurrentRoundHistory, replaceRoundHistory };
