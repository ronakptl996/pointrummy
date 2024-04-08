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

let scoreBoardTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  scoreBoardTimerQueue = new Bull(`StartScoreBoardTimer_3Plus`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelScoreBoardTimer = async (jobId: any, tableId: any) => {
  try {
    const jobData = await scoreBoardTimerQueue.getJob(jobId);
    Logger.info(
      tableId,
      ' cancelScoreBoardTimer :: JOB CANCELLED  :: JOB ID:" ---- ',
      jobId
    );
    if (jobData !== null) {
      Logger.info(tableId, " cancelScoreBoardTimer :: JOB AVAILABLE :: ");
      await jobData.remove();
    } else {
      Logger.info(tableId, " cancelScoreBoardTimer :: JOB NOT AVAILABLE :: ");
    }
  } catch (e) {
    Logger.error(tableId, "cancelScoreBoardTimer", e);
  }
};

export default cancelScoreBoardTimer;
