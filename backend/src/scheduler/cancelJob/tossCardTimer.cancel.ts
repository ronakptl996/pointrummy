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

let tossCardTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  tossCardTimerQueue = new Bull(`tossCardStart_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelTossCardTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, `---- cancelTossCardTimer ::=>> ${jobId}`);

    const job = await tossCardTimerQueue.getJob(jobId);
    if (job) {
      await job.remove();
      Logger.info(tableId, "job : cancelTossCardTimer :: success");
    }
  } catch (e) {
    Logger.error(tableId, "cancelTossCardTimer", e);
  }
};

export default cancelTossCardTimer;
