import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";

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

let nextTurnDelayTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  nextTurnDelayTimerQueue = new Bull(`nextTurnDelay_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelNextTurnDelayTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, `---- cancelNextTurnDelayTimer ::=>> ${jobId}`);

    const job = await nextTurnDelayTimerQueue.getJob(jobId);
    if (job) {
      await job.remove();
      Logger.info(tableId, "job : cancelNextTurnDelayTimer :: success");
    }
  } catch (error) {
    Logger.error(tableId, "cancelNextTurnDelayTimer", error);
  }
};

export default cancelNextTurnDelayTimer;
