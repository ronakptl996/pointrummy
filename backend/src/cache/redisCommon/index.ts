import { REDIS } from "../../constants";
import global from "../../global";

const setValueInKey = async (key: string, Data: any) => {
  return new Promise(function (resolve, reject) {
    global.redisClient
      .set(
        key,
        JSON.stringify(Data)
        //   ,
        //   function (err: any, data: any) {
        //     if (err) reject(err);
        //     resolve(data);
        //   }
      )
      .then((res: any) => resolve(res))
      .catch((err: any) => reject(err));
  });
};

// const getValueFromKey = async (key: string) => {
//   console.log("Call getValueFromKey");

//   return new Promise(function (resolve, reject) {
//     global.redisClient.get(key, function (err: any, data: any) {
//       console.log("getValueFromKey >> err", err);

//       if (err) reject(err);
//       console.log("getValueFromKey >> ", key, "-DATA >>", data);

//       resolve(JSON.parse(data));
//     });
//   });
// };

const getValueFromKey = async <T>(key: string): Promise<T | null> => {
  return new Promise(function (resolve, reject) {
    global.redisClient
      .get(key)
      .then((res: any) => resolve(res))
      .catch((err: any) => reject(err));
  });
};

const deleteKey = async (key: string) => global.redisClient.del(key);

const setValueInKeyWithExpiry = async (key: string, obj: any) => {
  const exp: number = 2 * 60 * 60;
  return global.redisClient.setex(key, exp, JSON.stringify(obj));
};

const pushIntoQueue = async (key: string, element: any) => {
  return new Promise(function (resolve, reject) {
    global.redisClient.lpush(
      `${REDIS.QUEUE}:${key}`,
      JSON.stringify(element),
      function (err: any, data: any) {
        if (err) reject(err);
        resolve(JSON.parse(data));
      }
    );
  });
};

const popFromQueue = async (key: string) => {
  return new Promise(function (resolve, reject) {
    global.redisClient.lpop(
      `${REDIS.QUEUE}:${key}`,
      function (err: any, data: any) {
        if (err) reject(err);
        resolve(JSON.parse(data));
      }
    );
  });
};

const setIncrementCounter = async (key: string) => {
  return new Promise(function (resolve, reject) {
    global.redisClient
      .incr(`${key}`)
      .then((res: any) => resolve(res))
      .catch((err: any) => reject(err));
  });
};

export = {
  setValueInKey,
  getValueFromKey,
  deleteKey,
  setValueInKeyWithExpiry,
  pushIntoQueue,
  popFromQueue,
  setIncrementCounter,
};
