const { api } = require('../api');
const { validator } = require('../validator');
const { PrivateKey } = require('dsteem');
const { accountsData } = require('../constants/accountsData');
const { actionTypes } = require('../constants/actionTypes');
const { appData } = require('../constants/appData');
const { getPostData, getOptions } = require('../helpers/dataMapper');

let index = 0;

const getAccount = () => {
    const currentIndex = index;
    if (++index === accountsData.length) {
        index = 0;
    }
    return accountsData[currentIndex];
};

async function processCreateObject(req, res) {
    this.attempts = this.attempts < appData.maxAttempts ? this.attempts + 1 : 1;
    try {
        const data = req.body;
        if (validator.validateCreateObject(data)) {
            const botAcc = getAccount();
            const transactionStatus = await api.createPost(
                getPostData(actionTypes.CREATE_OBJECT, data, botAcc),
                getOptions(data, botAcc),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                res.status(422).json({ error: 'Data is incorrect' })
            } else {
                res.status(200).json({ transactionId: transactionStatus.id, objectPermlink: data.permlink, objectAuthor: botAcc.name });
            }
        }
        else {
            res.status(422).json({ error: 'Not enough data', body: req.body })
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < appData.maxAttempts) {
            await processCreateObject.call(this ,req, res);
        } else {
            res.status(422).json({ error: e.message })
        }
    }
}

async function processAppendObject(req, res) {
    this.attempts = this.attempts < appData.maxAttempts ? this.attempts + 1 : 1;
    try {
        const data = req.body;
        if (validator.validateAppendObject(data)) {
            const botAcc = getAccount();
            const transactionStatus = await api.createPost(
                getPostData(actionTypes.APPEND_OBJECT, data, botAcc),
                getOptions(data, botAcc),
                PrivateKey.fromString(botAcc.postingKey)
            );
            if (!transactionStatus) {
                res.status(422).json({ error: 'Data is incorrect' })
            } else {
                res.status(200).json({ transactionId: transactionStatus.id, permlink: data.permlink, author: botAcc.name });
            }
        }
        else {
            res.status(422).json({ error: 'Not enough data', body: req.body })
        }
    }
    catch (e) {
        if (e.name === 'RPCError' && this.attempts < appData.maxAttempts) {
            await processAppendObject.call(this ,req, res);
        } else {
            res.status(422).json({ error: e.message })
        }
    }
}

module.exports = {
    processAppendObject, processCreateObject
};
