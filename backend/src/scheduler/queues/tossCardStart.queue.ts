import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import tossCardStartTimerProcess from "../processes/tossCardStart.process";

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  REDIS_DB,
  NODE_ENV,
  REDIS_CONNECTION_URL,
} = config.getConfig();

const SchedulerRedisConfig = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password: String(REDIS_AUTH),
};

let tossCardStartQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  tossCardStartQueue = new Bull(`tossCardStart_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const tossCardStartTimer = async (data: any) => {
  const tableId = data.tableId;
  try {
    Logger.info(tableId, `---- tossCardStart ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    await tossCardStartQueue.add(data, options);
    return tossCardStartQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

tossCardStartQueue.process(tossCardStartTimerProcess);

export default tossCardStartTimer;
