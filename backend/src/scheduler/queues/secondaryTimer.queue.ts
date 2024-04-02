import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import seconeryTurnTimerProcess from "../processes/seconeryTurnTimer.process";

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

let seconderyTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for Production
} else {
  seconderyTimerQueue = new Bull(`seconderyTimerQueue_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const secondaryTimerStart = async (data: any) => {
  const tableId = data.tableId;
  try {
    Logger.info(tableId, `---- seconderyTimer ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    await seconderyTimerQueue.add(data, options);
    return seconderyTimerQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

seconderyTimerQueue.process(seconeryTurnTimerProcess);

export default secondaryTimerStart;
