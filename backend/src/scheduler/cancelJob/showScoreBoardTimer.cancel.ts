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
  scoreBoardTimerQueue = new Bull(`ScoreBoardTimer_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelShowScoreBoardTimer = async (jobId: any, tableId: any) => {
  try {
    const jobData = await scoreBoardTimerQueue.getJob(jobId);

    Logger.info(
      tableId,
      ' cancelShowScoreBoardTimer :: JOB CANCELLED  :: JOB ID:" ---- ',
      jobId
    );
    Logger.info(
      tableId,
      ' cancelShowScoreBoardTimer :: JOB CANCELLED :: JOB ID:" job ---- ',
      jobData
    );
    if (jobData !== null) {
      Logger.info(tableId, " cancelShowScoreBoardTimer :: JOB AVAILABLE :: ");
      await jobData.remove();
    } else {
      Logger.info(
        tableId,
        " cancelShowScoreBoardTimer :: JOB NOT AVAILABLE :: "
      );
    }
  } catch (error) {
    Logger.error(tableId, "cancelShowScoreBoardTimer", error);
  }
};

export default cancelShowScoreBoardTimer;
