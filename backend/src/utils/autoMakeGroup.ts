import { NUMERICAL } from "../constants";
import Logger from "../logger";

const autoMakeGroup = (currentCard: any) => {
  try {
    let newGroup: string[] = [];
    let cardsGroup: string[][] = [];

    for (const card of currentCard) {
      if (card.length === NUMERICAL.ONE) {
        newGroup.push(card[0]);
      } else if (card.length > NUMERICAL.ONE) {
        cardsGroup.push(card);
      }
    }

    if (newGroup.length > NUMERICAL.ZERO) {
      cardsGroup.push(newGroup);
    }

    if (cardsGroup.length > NUMERICAL.SIX) {
      Logger.info("------------>> autoMakeGroup <<----------------- :: 1");
      return false;
    } else {
      return cardsGroup;
    }
  } catch (error) {
    Logger.error("--- autoMakeGroup :: ERROR :: ", error);
    throw error;
  }
};

export default autoMakeGroup;
