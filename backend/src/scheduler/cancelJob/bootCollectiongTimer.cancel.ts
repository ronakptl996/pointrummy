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

let bootCollectingTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  bootCollectingTimerQueue = new Bull(`cardDealing_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelBootCollectingTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, `---- cancelBootCollectingTimer ::=>> ${jobId}`);

    const job = await bootCollectingTimerQueue.getJob(jobId);
    if (job) {
      await job.remove();
      Logger.info(tableId, "job : cancelBootCollectingTimer :: success");
    }
  } catch (e) {
    Logger.error(tableId, "cancelBootCollectingTimer", e);
  }
};

export default cancelBootCollectingTimer;
