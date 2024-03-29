import Logger from "../logger";
import autoMakeGroup from "./autoMakeGroup";
import { ICards } from "../interfaces/inputOutputDataFormator";
import { isImpure, isPure, isSet, sortCard } from "./cardLogic";
import { CARDS_STATUS, NUMERICAL } from "../constants";
import { pointCalculate } from "../services/shuffleCards";
import { IDefaultPlayerGamePlay } from "../interfaces/playerGamePlay";
import { IManageAndUpdateData } from "../interfaces/round";

const manageAndUpdateData = async (
  currentCard: Array<Array<string>>,
  playerGamePlay: IDefaultPlayerGamePlay
): Promise<IManageAndUpdateData> => {
  const userId = playerGamePlay.userId;
  let cards: Array<ICards> = [];

  Logger.info(userId, " Before : currentCard :: ", currentCard);

  let isGroupMakes = autoMakeGroup(currentCard);
  let newGroupCardsArr: any =
    typeof isGroupMakes == "boolean" ? currentCard : isGroupMakes;

  for (const cardArray of newGroupCardsArr) {
    let ele = sortCard(cardArray);
    let PURE = isPure(ele);

    if (!PURE) {
      let IMPURE = isImpure(ele);
      if (!IMPURE) {
        let SET = isSet(ele);
        if (!SET) {
          cards.push({
            group: cardArray,
            groupType: CARDS_STATUS.INVALID,
            cardPoints: 0,
          });
        } else {
          cards.push({
            group: cardArray,
            groupType: CARDS_STATUS.SET,
            cardPoints: 0,
          });
        }
      } else {
        cards.push({
          group: cardArray,
          groupType: CARDS_STATUS.IMPURE,
          cardPoints: 0,
        });
      }
    } else {
      cards.push({
        group: cardArray,
        groupType: CARDS_STATUS.PURE,
        cardPoints: 0,
      });
    }
  }

  for (let i = 0; i < cards.length; i++) {
    const ele = cards[i];
    let waildCount: number = NUMERICAL.ZERO;
    if (
      ele.groupType == CARDS_STATUS.INVALID &&
      ele.group.length < NUMERICAL.THREE
    ) {
      ele.group.map((el: string) => {
        let arr = el.split("_");
        if (arr[NUMERICAL.TWO] == "J") {
          waildCount++;
        }

        if (waildCount == ele.group.length) {
          ele.groupType = CARDS_STATUS.WILD_CARD;
        }
      });
    }
  }

  // cards sorting
  let Invalid: Array<ICards> = <ICards[]>[];
  let Pure: Array<ICards> = <ICards[]>[];
  let Impure: Array<ICards> = <ICards[]>[];
  let Sets: Array<ICards> = <ICards[]>[];
  let Wild_Card: Array<ICards> = <ICards[]>[];

  for (let i = 0; i < cards.length; i++) {
    const element = cards[i];

    if (element.groupType == CARDS_STATUS.PURE) {
      Pure.push(element);
    } else if (element.groupType == CARDS_STATUS.IMPURE) {
      Impure.push(element);
    } else if (element.groupType == CARDS_STATUS.SET) {
      Sets.push(element);
    } else if (element.groupType == CARDS_STATUS.INVALID) {
      Invalid.push(element);
    } else if (element.groupType == CARDS_STATUS.WILD_CARD) {
      Wild_Card.push(element);
    }
  }

  cards = [...Pure, ...Impure, ...Sets, ...Invalid, ...Wild_Card];

  let newGroupCards = [];
  for (let i = 0; i < cards.length; i++) {
    const element = cards[i];
    newGroupCards.push(element.group);
  }

  Logger.info(userId, "After : newGroupCards :: ====>> ", newGroupCards);

  let allScoreArr: any[] = [];
  cards.map((ele) => {
    allScoreArr.push(pointCalculate(ele.group));
  });

  let allPromiseScoreArr = await Promise.all(allScoreArr);
  cards.map((ele, ind) => {
    ele.cardPoints = allPromiseScoreArr[ind];
  });

  playerGamePlay.currentCards = newGroupCards;
  playerGamePlay.groupingCards.pure = [];
  playerGamePlay.groupingCards.impure = [];
  playerGamePlay.groupingCards.set = [];
  playerGamePlay.groupingCards.dwd = [];

  let pureCount: number = NUMERICAL.ZERO;
  let impureCount: number = NUMERICAL.ZERO;
  let totalScorePoint: number = NUMERICAL.ZERO;

  for (let i = 0; i < cards.length; i++) {
    const ele = cards[i];
    if (ele.groupType == CARDS_STATUS.PURE) {
      pureCount++;
    }
    if (ele.groupType == CARDS_STATUS.IMPURE) {
      impureCount++;
    }
  }

  for (let i = 0; i < cards.length; i++) {
    const ele = cards[i];
    if (ele.groupType == CARDS_STATUS.PURE) {
      playerGamePlay.groupingCards.pure.push(ele.group);
      ele.cardPoints = NUMERICAL.ZERO;
    }
    if (ele.groupType == CARDS_STATUS.IMPURE) {
      playerGamePlay.groupingCards.impure.push(ele.group);
      if (pureCount > NUMERICAL.ZERO) {
        ele.cardPoints = NUMERICAL.ZERO;
      }
    }
    if (ele.groupType == CARDS_STATUS.SET) {
      playerGamePlay.groupingCards.set.push(ele.group);
      if (
        pureCount > NUMERICAL.ONE ||
        (pureCount > NUMERICAL.ZERO && impureCount > NUMERICAL.ZERO)
      ) {
        ele.cardPoints = NUMERICAL.ZERO;
      }
    }
    if (
      ele.groupType == CARDS_STATUS.INVALID ||
      ele.groupType == CARDS_STATUS.WILD_CARD
    ) {
      playerGamePlay.groupingCards.dwd.push(ele.group);
    }
    totalScorePoint = totalScorePoint + ele.cardPoints;
  }

  Logger.info(userId, " totalScorePoint :: ", totalScorePoint);

  totalScorePoint > NUMERICAL.EIGHTY
    ? (totalScorePoint = NUMERICAL.EIGHTY)
    : totalScorePoint;

  return { cards, totalScorePoint, playerGamePlayUpdated: playerGamePlay };
};

export default manageAndUpdateData;
