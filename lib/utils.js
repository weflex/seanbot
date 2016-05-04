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

exports.parseCommentBody = parseCommentBody;
