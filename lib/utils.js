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
  const masks = [MAJOR, MINOR, PATCH];
  return masks;
}

function getPrMsgFormUrl(url) {
  const m = /^https:\/\/api\.github\.com\/repos\/(\w+)\/(\w+)\/pulls\/(\w+)$/.exec(url);
  return {
    user: m[1],
    repo: m[2],
    number: m[3],
  };
}

function getBranchMsgFormHtmlUrl(url) {
  const m = /^https:\/\/github\.com\/(\w+)\/(\w+)\/blob\/(\w+)\/package.json$/.exec(url);
  return {
    user: m[1],
    repo: m[2],
    branch: m[3],
  };
}

exports.getMasksFromCommentBody = getMasksFromCommentBody;
exports.getPrMsgFormUrl = getPrMsgFormUrl;
exports.getBranchMsgFormHtmlUrl = getBranchMsgFormHtmlUrl;
