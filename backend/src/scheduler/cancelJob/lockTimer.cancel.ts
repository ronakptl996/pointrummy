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

let lockTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  lockTimerQueue = new Bull(`lockTimerStart_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelLockTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, `---- cancelLockTimer :::=>> ${jobId}`);

    const job = await lockTimerQueue.getJob(jobId);
    if (job) {
      await job.remove();
      Logger.info(tableId, "job : cancelLockTimer :: success");
    }
  } catch (e) {
    Logger.error(tableId, "cancelLockTimer", e);
  }
};

export default cancelLockTimer;
