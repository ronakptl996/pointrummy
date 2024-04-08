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

let roundTimerStartQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  roundTimerStartQueue = new Bull(`roundTimerStart_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelRoundTimerStart = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, `---- cancelRoundTimerStart ::=>> ${jobId}`);
    const job = await roundTimerStartQueue.getJob(jobId);

    if (job) {
      Logger.info(tableId, "job : cancelrobotSeatTimer :: success");
      await job.remove();
    }
  } catch (error) {
    Logger.error(tableId, "cancelRoundTimerStart", error);
  }
};

export default cancelRoundTimerStart;
