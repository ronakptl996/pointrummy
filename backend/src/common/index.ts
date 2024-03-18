import { NUMERICAL } from "../constants";
import _ from "underscore";

const GetRandomInt = (min: number, max: number) => {
  const rnd: number =
    Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min);
  return Number(rnd);
};

export { GetRandomInt };
