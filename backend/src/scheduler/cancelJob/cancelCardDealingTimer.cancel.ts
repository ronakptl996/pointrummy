import Logger from "../../logger";
import Bull from "bull";
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

let cardDealingTimerQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) for production
} else {
  cardDealingTimerQueue = new Bull(`cardDealing_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cancelCardDealingTimer = async (jobId: any, tableId: string) => {
  try {
    Logger.info(tableId, `---- cancelCardDealingTimer ::=>> ${jobId}`);

    const job = await cardDealingTimerQueue.getJob(jobId);
    if (job) {
      await job.remove();
      Logger.info(tableId, "job : cancelCardDealingTimer :: success");
    }
  } catch (e) {
    Logger.error(tableId, "cancelCardDealingTimer", e);
  }
};

export default cancelCardDealingTimer;
