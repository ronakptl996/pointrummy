import Logger from "../../logger";
import { NUMERICAL, SHUFFLE_CARDS } from "../../constants";
import { shuffleCards } from "../../common";

const pointCalculate = (cards: any[]) => {
  let arrNumber: any[] = [];
  cards.map((ele) => {
    let arr = ele.split("_");
    if (arr[NUMERICAL.TWO] == String(NUMERICAL.ZERO)) {
      arr[NUMERICAL.ONE] > NUMERICAL.TEN
        ? arrNumber.push(NUMERICAL.TEN)
        : arrNumber.push(Number(arr[NUMERICAL.ONE]));
    }
  });

  const sum: number = arrNumber.reduce((partialSum, a) => partialSum + a, 0);
  let res: number = sum > NUMERICAL.EIGHTY ? NUMERICAL.EIGHTY : sum;

  return res;
};

const setDistributedCard = async (
  maximumPlayerCount: number,
  totalActivePlayer: number,
  tableId: string
) => {
  try {
    Logger.info(tableId, "totalActivePlayer :>> ", totalActivePlayer);

    let cardArray = [];
    const cards = [];
    let s1_card = [];
    let s2_card = [];
    let s3_card = [];
    let s4_card = [];
    let s5_card = [];
    let s6_card = [];
    let s1_points;
    let s2_points;
    let s3_points;
    let s4_points;
    let s5_points;
    let s6_points;

    cardArray = SHUFFLE_CARDS.DECK_ONE.concat(SHUFFLE_CARDS.DECK_TWO).concat(
      SHUFFLE_CARDS.JOKER
    );

    Logger.info(
      tableId,
      "Defalt 2-Deck cardArray.length :>> ",
      cardArray.length
    );

    // Create Joker
    const jokerCard = Math.floor(Math.random() * cardArray.length);
    console.log("jokerCard =======>>>>", jokerCard);

    let joker = cardArray.splice(jokerCard, NUMERICAL.ONE)[0];
    console.log("OOOOOOyyyyyyyyyyyyyy jokar", joker);

    if (joker == "J_J_J_1" || joker == "J_J_J_2") {
      joker = "S_14_0_1";
    }
    console.log("OOOOOOyyyyyyyyyyyyyy jokar 111", joker);

    const trumpCard: string[] = [joker];
    Logger.info(tableId, "trumpCard :: ", trumpCard);

    let value = joker.split("_");
    cardArray = cardArray.map((ele, ind) => {
      let tempcard = ele.split("_");
      if (tempcard[1] == value[1]) {
        return (ele = `${tempcard[0]}_${tempcard[1]}_J_${tempcard[3]}`);
      }
      return ele;
    });
    Logger.info(
      tableId,
      "cardArray updated with joker and wlid card :>> ",
      cardArray
    );

    const twoDeck = cardArray;
    const shuffle = shuffleCards(twoDeck);
    cardArray = shuffleCards(shuffle);

    const opendDeck: string[] = cardArray.splice(0, NUMERICAL.ONE);
    Logger.info(tableId, " opendDeck :: ", opendDeck);

    if (totalActivePlayer == NUMERICAL.ONE) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s1_points = pointCalculate(s1_card);

      cards.push({ card: s1_card, points: s1_points });
    }

    if (totalActivePlayer == NUMERICAL.TWO) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = pointCalculate(s1_card);
      s2_points = pointCalculate(s2_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
    }

    if (totalActivePlayer == NUMERICAL.THREE) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = pointCalculate(s1_card);
      s2_points = pointCalculate(s2_card);
      s3_points = pointCalculate(s3_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
      cards.push({ card: s3_card, points: s3_points });
    }

    if (totalActivePlayer == NUMERICAL.FOUR) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = pointCalculate(s1_card);
      s2_points = pointCalculate(s2_card);
      s3_points = pointCalculate(s3_card);
      s4_points = pointCalculate(s4_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
      cards.push({ card: s3_card, points: s3_points });
      cards.push({ card: s4_card, points: s4_points });
    }

    if (totalActivePlayer == NUMERICAL.FIVE) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s5_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = pointCalculate(s1_card);
      s2_points = pointCalculate(s2_card);
      s3_points = pointCalculate(s3_card);
      s4_points = pointCalculate(s4_card);
      s5_points = pointCalculate(s5_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
      cards.push({ card: s3_card, points: s3_points });
      cards.push({ card: s4_card, points: s4_points });
      cards.push({ card: s5_card, points: s5_points });
    }

    if (totalActivePlayer == NUMERICAL.SIX) {
      s1_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s2_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s3_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s4_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s5_card = cardArray.splice(0, NUMERICAL.THIRTEEN);
      s6_card = cardArray.splice(0, NUMERICAL.THIRTEEN);

      s1_points = pointCalculate(s1_card);
      s2_points = pointCalculate(s2_card);
      s3_points = pointCalculate(s3_card);
      s4_points = pointCalculate(s4_card);
      s5_points = pointCalculate(s5_card);
      s6_points = pointCalculate(s6_card);

      cards.push({ card: s1_card, points: s1_points });
      cards.push({ card: s2_card, points: s2_points });
      cards.push({ card: s3_card, points: s3_points });
      cards.push({ card: s4_card, points: s4_points });
      cards.push({ card: s5_card, points: s5_points });
      cards.push({ card: s6_card, points: s6_points });
    }

    return { cardAndPoint: cards, closedDeck: cardArray, opendDeck, trumpCard };
  } catch (error) {
    Logger.error(tableId, "setDistributedCard error", error);
    throw new Error("setDistributedCard error");
  }
};

export { pointCalculate, setDistributedCard };
