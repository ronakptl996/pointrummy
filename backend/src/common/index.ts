import { NUMERICAL } from "../constants";
import _ from "underscore";

const GetRandomInt = (min: number, max: number) => {
  const rnd: number =
    Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min);
  return Number(rnd);
};

const diffSeconds = (date1: Date, date2: Date): number => {
  const diff = (new Date(date1).getTime() - new Date(date2).getTime()) / 1000;

  return Math.ceil(diff);
};

const shuffleCards = (Cards: string[]) => {
  const cards = _.clone(Cards);
  const shuffle = [];
  while (cards.length > 0) {
    const rt = Math.floor(Math.random() * cards.length);
    shuffle.push(cards[rt]);
    cards.splice(rt, 1);
  }
  return shuffle;
};

export { GetRandomInt, diffSeconds, shuffleCards };
