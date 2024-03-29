import Bull from "bull";
import Logger from "../../logger";
import config from "../../config";
import cardDealingProcess from "../processes/cardDealing.process";

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

let cardDealingQueue: any;
if (NODE_ENV === "PRODUCTION") {
  // (IMPLEMENT) Production
} else {
  cardDealingQueue = new Bull(`cardDealing_Rummy`, {
    redis: SchedulerRedisConfig,
  });
}

const cardDealingStartTimer = async (data: any) => {
  const tableId = data.tableId;
  try {
    Logger.info(tableId, `---- cardDealing ::=>> ${JSON.stringify(data)}`);

    const options = {
      delay: data.timer, // in ms
      jobId: data.jobId,
      removeOnComplete: true,
    };

    await cardDealingQueue.add(data, options);
    return cardDealingQueue;
  } catch (error) {
    Logger.error(tableId, error);
  }
};

cardDealingQueue.process(cardDealingProcess);

export default cardDealingStartTimer;
