import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import nextTurnDelayProcess from "../processes/nextTurnDelay.process";

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

let nextTurnDelayQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (Implement) for production
} else {
  nextTurnDelayQueue = new Bull(`nextTurnDelay_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const nextTurnDelay = async (data: any) => {
  const tableId = data.tableId;
  try {
    Logger.info(tableId, `---- nextTurnDelay ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer,
      jobId: data.jobId,
      removeOnComplete: true,
    };
    await nextTurnDelayQueue.add(data, options);
    return nextTurnDelayQueue;
  } catch (error) {
    Logger.error(tableId, error, "error while nextTurnDelay queue");
  }
};

nextTurnDelayQueue.process(nextTurnDelayProcess);

export default nextTurnDelay;
