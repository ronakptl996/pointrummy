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

const getValueFromKey = async <T>(key: string): Promise<T | null> => {
  return new Promise(function (resolve, reject) {
    global.redisClient
      .get(key)
      .then((res: any) => resolve(JSON.parse(res)))
      .catch((err: any) => reject(err));
  });
};

const deleteKey = async (key: string) => global.redisClient.del(key);

const setValueInKeyWithExpiry = async (
  key: string,
  obj: any
): Promise<boolean> => {
  const exp: number = 2 * 60 * 60;

  return new Promise(function (resolve, reject) {
    global.redisClient
      .set(key, JSON.stringify(obj))
      .then((res: any) => {
        global.redisClient.expire(key, exp);
        resolve(res);
      })
      .catch((err: any) => reject(err));
  });
};

// CHANGES FUNCTION to then
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

// CHANGES FUNCTION to then
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
