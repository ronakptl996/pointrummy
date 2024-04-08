import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";

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

let rejoinTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  rejoinTimerQueue = new Bull(`rejoinTimer_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelRejoinTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, "--- cancelRejoinTimer ==>>", jobId);
    const job = await rejoinTimerQueue.getJob(jobId);

    if (job !== null) {
      await job.remove();
      Logger.info(tableId, "job : cancelRejoinTimer :: success");
    } else {
      Logger.info(
        tableId,
        "===========>> cancelRejoinTimer :: JOB NOT AVAILABLE :: "
      );
    }
  } catch (error) {
    Logger.error(tableId, "cancelRejoinTimer", error);
  }
};

export default cancelRejoinTimer;
