'use strict';

function getMasksFromCommentBody(commentBody) {
  let MAJOR = 0;
  let MINOR = 0;
  let PATCH = 0;
  if (commentBody.match('major')) {
    MAJOR = 1;
  } else if (commentBody.match('minor')) {
    MINOR = 1;
  } else if (commentBody.match('patch')) {
    PATCH = 1;
  } else {
    return null;
  }
  return [MAJOR, MINOR, PATCH];
}

function getPrMsgFormUrl(url) {
  const m = /^https:\/\/api\.github\.com\/repos\/([a-z0-9\-_]+)\/([a-z0-9\-_]+)\/pulls\/([a-z0-9\-_]+)$/i.exec(url);
  return {
    user: m[1],
    repo: m[2],
    number: m[3],
  };
}

function getBranchMsgFormHtmlUrl(url) {
  const m = /^https:\/\/github\.com\/([a-z0-9\-_]+)\/([a-z0-9\-_]+)\/blob\/([a-z0-9\-_]+)\/package.json$/i.exec(url);
  return {
    user: m[1],
    repo: m[2],
    branch: m[3],
  };
}

exports.getMasksFromCommentBody = getMasksFromCommentBody;
exports.getPrMsgFormUrl = getPrMsgFormUrl;
exports.getBranchMsgFormHtmlUrl = getBranchMsgFormHtmlUrl;
