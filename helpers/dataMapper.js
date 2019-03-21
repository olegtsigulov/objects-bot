const { appData } = require('../constants/appData');
const { actionTypes } = require('../constants/actionTypes');
const { orderBy } = require('lodash');

const getPermlink = str => `${Math.random()
    .toString(36)
    .substring(2)}-${str.toLowerCase()}`;

const getOptions = (reqData, accData, type) => {
    const optionsData = {};
    let beneficiaries = [];
    switch (type) {
        case actionTypes.CREATE_OBJECT_TYPE:
        case actionTypes.FORECAST_EXPIRED:
            beneficiaries = orderBy([
                { weight: 1500, account: accData.name },
                { weight: 8500, account: appData.appAccName }
            ], ['account'], ['asc']);
            break;
        case actionTypes.CREATE_OBJECT:
        case actionTypes.APPEND_OBJECT:
        default:
            beneficiaries = orderBy([
                { weight: 1500, account: accData.name },
                { weight: 1500, account: appData.appAccName },
                { weight: 7000, account: reqData.author }
            ], ['account'], ['asc']);
            break;
    }
    optionsData.author = accData.name;
    optionsData.max_accepted_payout = '100000.000 SBD';
    optionsData.percent_steem_dollars = 0;
    optionsData.allow_votes = true;
    optionsData.allow_curation_rewards = true;
    optionsData.permlink = reqData.permlink;
    optionsData.extensions = [[ 0, { beneficiaries } ]];

    return optionsData;
};

const getPostData = (reqData, accData, type) => {
    const appendObjPostData = {};
    const metadata = {
        app: `${appData.appName}/${appData.version}`,
        community: '',
        tags: appData.appendObjectTag
    };

    appendObjPostData.author = accData.name;
    appendObjPostData.body = reqData.body;
    appendObjPostData.permlink = reqData.permlink;
    appendObjPostData.title = "";

    switch (type) {
        case actionTypes.CREATE_OBJECT_TYPE:
            appendObjPostData.parent_author = '';
            appendObjPostData.parent_permlink = appData.objectTypeTag;
            appendObjPostData.title = `Object Type - ${reqData.objectType}`;
            appendObjPostData.body = 'Description will be here..';
            metadata.wobj = {
                action: type,
                name: reqData.objectType.trim().toLowerCase(),
            };
            break;
        case actionTypes.CREATE_OBJECT:
            appendObjPostData.parent_author = reqData.parentAuthor;
            appendObjPostData.parent_permlink = reqData.parentPermlink;
            metadata.wobj = {
                action: type,
                creator: reqData.author,
                is_posting_open: Boolean(reqData.isPostingOpen),
                is_extending_open: Boolean(reqData.isExtendingOpen),
                //object_type: reqData.type, // is it needed?
            };
            break;
        case actionTypes.APPEND_OBJECT:
            appendObjPostData.parent_author = reqData.parentAuthor;
            appendObjPostData.parent_permlink = reqData.parentPermlink;
            metadata.wobj = {
                action: type,
                creator: reqData.author,
                field: reqData.field,
            };
            break;
        case actionTypes.FORECAST_EXPIRED:
            appendObjPostData.parent_author = reqData.parentAuthor;
            appendObjPostData.parent_permlink = reqData.parentPermlink;
            metadata.app = 'wia/1.0';
            metadata.tags = 'expired_forecast';
            metadata.wia = {
                action: type,
                exp_forecast: reqData.expForecast
            };
            break;
        default:
            break;
    }

    appendObjPostData.json_metadata = JSON.stringify(metadata);

    return appendObjPostData;
};

const getAppendRequestBody = (reqData, accData) => (
    {
        body: {
            author: reqData.author,
            parentAuthor: accData.name,
            parentPermlink: reqData.permlink,
            body: `${reqData.author} added name(${reqData.locale || 'uk-UA'}):\n ${reqData.objectName}`,
            title: "",
            field: {
                name: "name",
                body: reqData.objectName,
                locale: reqData.locale || "uk-UA",
            },
            permlink: `${reqData.author}-${Math.random()
                .toString(36)
                .substring(2)}`,
            lastUpdated: Date.now(),
            wobjectName: reqData.objectName
        }
    }
);

module.exports = {
    getPermlink, getPostData, getOptions, getAppendRequestBody
};
