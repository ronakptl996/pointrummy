import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import lockTimerStartProcess from "../processes/lockTimerStart.process";

const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_AUTH,
  REDIS_DB,
  REDIS_CONNECTION_URL,
  NODE_ENV,
} = config.getConfig();

const SchedulerRedisConfig = {
  host: String(REDIS_HOST),
  port: Number(REDIS_PORT),
  db: Number(REDIS_DB),
  password: String(REDIS_AUTH),
};

let lockTimerStartQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) Production
} else {
  lockTimerStartQueue = new Bull(`lockTimerStart_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const lockTimerStart = async (data: any) => {
  const tableId = data.tableId;
  try {
    Logger.info(tableId, `---- lockTimerStart ::=>> ${JSON.stringify(data)}`);
    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    await lockTimerStartQueue.add(data, options);
    return lockTimerStartQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

lockTimerStartQueue.process(lockTimerStartProcess);

export default lockTimerStart;
