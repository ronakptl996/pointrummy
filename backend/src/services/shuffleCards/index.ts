import { NUMERICAL } from "../../constants";

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

export { pointCalculate };
