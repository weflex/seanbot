'use strict';

const leven = require('leven');

function getFuzzyMatchFunction(str) {
  const words = str.split(' ');
  return function match(matchWord, distance) {
    for (let index  = 0; index < words.length; index++) {
      const word = words[index];
      if (leven(matchWord, word) <= distance) {
        return true;
      }
    }
    return false;
  };
}

function parseCommentBody(commentBody) {
  const commentBodyMatch = getFuzzyMatchFunction(commentBody);
  if (!commentBodyMatch('@seanbot', 2) || !commentBodyMatch('bump', 1)) {
    return null;
  }
  let MAJOR = 0;
  let MINOR = 0;
  let PATCH = 0;
  if (commentBodyMatch('major', 1)) {
    MAJOR = 1;
  } else if (commentBodyMatch('minor', 2)) {
    MINOR = 1;
  } else if (commentBodyMatch('patch', 2)) {
    PATCH = 1;
  } else {
    return null;
  }
  return [MAJOR, MINOR, PATCH];
}

function getPrMsgFormUrl(url) {
  const m = /^https:\/\/api\.github\.com\/repos\/([a-z0-9\-_]+)\/([a-z0-9\-_]+)\/pulls\/(.+)$/i.exec(url);
  return {
    user: m[1],
    repo: m[2],
    number: m[3],
  };
}

function getBranchMsgFormHtmlUrl(url) {
  const m = /^https:\/\/github\.com\/([a-z0-9\-_]+)\/([a-z0-9\-_]+)\/blob\/(.+)\/package.json$/i.exec(url);
  return {
    user: m[1],
    repo: m[2],
    branch: m[3],
  };
}

exports.parseCommentBody = parseCommentBody;
exports.getPrMsgFormUrl = getPrMsgFormUrl;
exports.getBranchMsgFormHtmlUrl = getBranchMsgFormHtmlUrl;
