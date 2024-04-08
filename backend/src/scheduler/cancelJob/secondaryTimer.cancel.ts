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

let seconderyTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  seconderyTimerQueue = new Bull(`seconderyTimerQueue_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelSeconderyTimer = async (jobId: any, tableId: string) => {
  try {
    const jobData = await seconderyTimerQueue.getJob(jobId);

    Logger.info(
      tableId,
      ' cancelSeconderyTimer :: JOB CANCELLED  :: JOB ID:" ----',
      jobId
    );
    if (jobData) {
      await jobData.remove();
      Logger.info(tableId, " cancelSeconderyTimer :: JOB AVAILABLE :: ");
    } else {
      Logger.info(tableId, " cancelSeconderyTimer :: JOB NOT AVAILABLE :: ");
    }
  } catch (e) {
    Logger.error(tableId, "cancelSeconderyTimer", e);
  }
};

export default cancelSeconderyTimer;
