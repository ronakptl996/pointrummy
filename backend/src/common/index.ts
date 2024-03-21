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

export { GetRandomInt, diffSeconds };
