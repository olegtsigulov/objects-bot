const { redisQueue, actionsRsmqClient } = require('utilities/redis/rsmq');
const { redisSetter } = require('utilities/redis');
const { regExp, guestRequestsData } = require('constants/index');
const config = require('config');
const addBotsToEnv = require('utilities/operations/addBotsToEnv');
const broadcastHelper = require('utilities/helpers/broadcastHelper');

const postBroadcaster = async (noMessageWait = 6000, postingErrorWait = 60000) => {
  const { error: redisError, result: message } = await redisQueue.receiveMessage({
    client: actionsRsmqClient,
    qname: guestRequestsData.postAction.qname,
  });

  if (redisError) {
    if (redisError.message === 'No messages') {
      // console.error( `ERR[PostBroadcasting] ${redisError.message}` );
      await new Promise((r) => setTimeout(r, noMessageWait));
      return;
    }
  }
  if (message) {
    const accounts = await addBotsToEnv.setEnvData();
    const account = accounts.proxyBots[config.guest_comment.account];
    const {
      error: broadcastError,
      result: transactionStatus,
    } = await broadcastHelper.switcher(message.message, account);

    if (transactionStatus) {
      config.guest_comment.account === accounts.proxyBots.length - 1
        ? config.guest_comment.account = 0
        : config.guest_comment.account += 1;
      config.guest_comment.attempts = 0;
      console.info(`INFO[postBroadcasting] Post successfully send | transaction id ${transactionStatus.id}`);
    } else if (config.guest_comment.attempts === (accounts.proxyBots.length - 1)) {
      console.error(`ERR[postBroadcasting] RPCError: ${broadcastError.message}`);
      await new Promise((resolve) => setTimeout(resolve, postingErrorWait));
      config.guest_comment.attempts = 0;
      return;
    } else if (broadcastError && regExp.steemErrRegExp.test(broadcastError.message)) {
      console.warn(`ERR[postBroadcasting] RPCError: ${broadcastError.message}`);
      config.guest_comment.attempts += 1;
      config.guest_comment.account === accounts.proxyBots.length - 1
        ? config.guest_comment.account = 0
        : config.guest_comment.account += 1;
      return;
    }
    await redisQueue.deleteMessage(
      { client: actionsRsmqClient, qname: guestRequestsData.postAction.qname, id: message.id },
    );
    if (broadcastError && broadcastError.message === 'update error') {
      await redisQueue.sendMessage(
        {
          client: actionsRsmqClient,
          qname: guestRequestsData.postAction.qname,
          message: message.message,
        },
      );
      return;
    }
    await redisSetter.delActionsData(message.message);
  }
};

const commentBroadcaster = async (noMessageWait = 10000, postingErrorWait = 10000) => {
  const { error: redisError, result: message } = await redisQueue.receiveMessage({
    client: actionsRsmqClient,
    qname: guestRequestsData.commentAction.qname,
  });

  if (redisError) {
    if (redisError.message === 'No messages') {
      // console.error( `ERR[CommentBroadcasting] ${redisError.message}` );
      await new Promise((r) => setTimeout(r, noMessageWait));
      return;
    }
  }
  if (message) {
    const accounts = await addBotsToEnv.setEnvData();

    const account = accounts.proxyBots[config.guest_comment.accountForComm];
    const {
      error: broadcastError,
      result: transactionStatus,
    } = await broadcastHelper.switcher(message.message, account);

    if (transactionStatus) {
      config.guest_comment.accountForComm === accounts.proxyBots.length - 1
        ? config.guest_comment.accountForComm = 0
        : config.guest_comment.accountForComm += 1;
      config.guest_comment.attemptsComm = 0;
      console.info(`INFO[commentBroadcasting] Comment successfully send | transaction id ${transactionStatus.id}`);
    } else if
    (config.guest_comment.attemptsComm === (accounts.proxyBots.length - 1)) {
      console.error(`ERR[commentBroadcasting] RPCError: ${broadcastError.message}`);
      await new Promise((resolve) => setTimeout(resolve, postingErrorWait));
      config.guest_comment.attemptsComm = 0;
      return;
    } else if (broadcastError && regExp.steemErrRegExp.test(broadcastError.message)) {
      console.warn(`ERR[commentBroadcasting] RPCError: ${broadcastError.message}`);
      config.guest_comment.attemptsComm += 1;
      config.guest_comment.accountForComm === accounts.proxyBots.length - 1
        ? config.guest_comment.accountForComm = 0
        : config.guest_comment.accountForComm += 1;
      return;
    }
    await redisQueue.deleteMessage(
      { client: actionsRsmqClient, qname: guestRequestsData.commentAction.qname, id: message.id },
    );
    await redisSetter.delActionsData(message.message);
  }
};

module.exports = { postBroadcaster, commentBroadcaster };
