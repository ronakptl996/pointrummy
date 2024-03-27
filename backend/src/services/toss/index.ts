import Logger from "../../logger";
import commonEventEmitter from "../../commonEventEmitter";
import { tableGamePlayCache, userProfileCache } from "../../cache";
import { shuffleCards } from "../../common";
import { EVENT, NUMERICAL, PLAYER_STATE, SHUFFLE_CARDS } from "../../constants";
import { ITossCards, ITossWinnerData, ITosscard } from "../../interfaces/round";
import { IUserProfileOutput } from "../../interfaces/userProfile";
import { ISeats } from "../../interfaces/signup";
import { formatTossCardData } from "../../formatResponseData";

const tossCards = async (tableId: string) => {
  try {
    const tableGamePlay = await tableGamePlayCache.getTableGamePlay(tableId);
    if (!tableGamePlay) throw Error("Unable to get data");

    let cardArray = SHUFFLE_CARDS.DECK_ONE;
    cardArray = shuffleCards(cardArray);

    function rendomCard(cards: string[]) {
      const rt = Math.floor(Math.random() * cards.length);
      return rt;
    }

    const tossCardArr: ITosscard[] = [];
    for (let i = 0; i < tableGamePlay.seats.length; i++) {
      const ele: ISeats = tableGamePlay.seats[i];
      const tossCardObj = <ITosscard>{};
      let tossCardInd = rendomCard(cardArray);
      if (ele.userState == PLAYER_STATE.PLAYING) {
        tossCardObj.userId = ele.userId;
        tossCardObj.si = ele.si;
        tossCardObj.name = ele.name;
        tossCardObj.card = cardArray.splice(tossCardInd, NUMERICAL.ONE)[0];
        tossCardArr.push(tossCardObj);
      }
    }

    Logger.info(tableId, " Before :: tossCardArr :>> ", tossCardArr);
    const cardValueArr = <number[]>[];
    const cardSuitArr = <string[]>[];
    let tossWinIndexArr: number = NUMERICAL.ZERO;
    tossCardArr.map((ele, ind) => {
      let cardArr: string[] = ele.card.split("_");
      cardSuitArr.push(cardArr[NUMERICAL.ZERO]);
      cardValueArr.push(Number(cardArr[NUMERICAL.ONE]));
    });

    let largevalue = Math.max(...cardValueArr);
    const counts: any = {};
    cardValueArr.forEach(function (x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    if (counts[String(largevalue)] > NUMERICAL.ONE) {
      const suitArr: any = [];
      const suitIndex: any = [];
      cardValueArr.map((ele, index) => {
        if (ele == largevalue) {
          suitArr.push(cardSuitArr[index]);
          suitIndex.push(index);
        }
      });

      let inde = suitArr.findIndex((ele: any) => ele == "S");
      tossWinIndexArr = suitIndex[inde];

      if (inde == -1) {
        let inde = suitArr.findIndex((ele: any) => ele == "D");
        tossWinIndexArr = suitIndex[inde];

        if (inde == -1) {
          let inde = suitArr.findIndex((ele: any) => ele == "C");
          tossWinIndexArr = suitIndex[inde];
        }
      }
    } else {
      tossWinIndexArr = cardValueArr.indexOf(Math.max(...cardValueArr));
    }

    Logger.info(tableId, "tossWinIndexArr :>> ", tossWinIndexArr);

    let tossWinnerData = <ITossWinnerData>{};
    tossWinnerData.userId = tossCardArr[tossWinIndexArr].userId;
    tossWinnerData.si = tossCardArr[tossWinIndexArr].si;
    tossWinnerData.card = tossCardArr[tossWinIndexArr].card;
    tossWinnerData.name = tossCardArr[tossWinIndexArr].name;
    tossWinnerData.msg = `${tossWinnerData.name} Won The Toss`;

    tableGamePlay.tossWinPlayer = tossCardArr[tossWinIndexArr].si;

    await tableGamePlayCache.insertTableGamePlay(tableGamePlay, tableId);

    const formatedTossCardData: ITossCards = await formatTossCardData(
      tableId,
      tossCardArr,
      tossWinnerData
    );

    Logger.info(tableId, " formatedTossCardData :>> ", formatedTossCardData);

    for await (const seat of tableGamePlay.seats) {
      if (seat.userState === PLAYER_STATE.PLAYING) {
        const userProfile = (await userProfileCache.getUserProfile(
          seat.userId
        )) as IUserProfileOutput;
        commonEventEmitter.emit(EVENT.TOSS_CARD_SOCKET_EVENT, {
          socket: userProfile.socketId,
          tableId,
          data: formatedTossCardData,
        });
      }
    }

    return true;
  } catch (error) {
    Logger.error(tableId, error, ` table ${tableId} function tossCards`);
  }
};

export default tossCards;
