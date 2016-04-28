'use strict';

const FuzzyMatching = require('fuzzy-matching');

function getFuzzyMatchFunction(str) {
  const words = str.split(' ');
  const fm =  new FuzzyMatching(words);
  return (word) => {
    return fm.get(word).distance > 0.7;
  };
}

function parseCommentBody(commentBody) {
  const commentBodyMatch = getFuzzyMatchFunction(commentBody);
  if (!commentBodyMatch('@seanbot') || !commentBodyMatch('bump')) {
    return null;
  }
  let MAJOR = 0;
  let MINOR = 0;
  let PATCH = 0;
  if (commentBodyMatch('major')) {
    MAJOR = 1;
  } else if (commentBodyMatch('minor')) {
    MINOR = 1;
  } else if (commentBodyMatch('patch')) {
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
