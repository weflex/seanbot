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
  const list = url.split('/');
  return {
    user: list[4],
    repo: list[5],
    number: list[7],
  };
}

function getBranchMsgFormHtmlUrl(url) {
  const list = url.split('/');
  return {
    user: list[3],
    repo: list[4],
    branch: list[6],
  };
}

exports.getMasksFromCommentBody = getMasksFromCommentBody;
exports.getPrMsgFormUrl = getPrMsgFormUrl;
exports.getBranchMsgFormHtmlUrl = getBranchMsgFormHtmlUrl;
