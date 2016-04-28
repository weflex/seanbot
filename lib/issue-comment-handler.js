'use strict';

const github = require('./github');
const bumpVersion = require('semver-increment');
const promisify = require('es6-promisify');
const parseCommentBody = require('./utils').parseCommentBody;
const getPrMsgFormUrl = require('./utils').getPrMsgFormUrl;
const getBranchMsgFormHtmlUrl = require('./utils').getBranchMsgFormHtmlUrl;

const getPullRequests = promisify(github.pullRequests.get.bind(github.pullRequests));
const getContent = promisify(github.repos.getContent.bind(github.repos));
const updateFile = promisify(github.repos.updateFile.bind(github.repos));

function issueCommentHandler(event) {
  const payload = event.payload;
  const pullRequests = payload.issue.pull_request;
  if (!pullRequests) {
    console.log('It isn\'t a pull request.');
    return;
  }
  const commentBody = payload.comment.body.toLowerCase();
  const masks = parseCommentBody(commentBody);
  if (!masks) {
    console.log(commentBody, 'It\'s not a bump action.');
    return;
  }
  getPullRequests(getPrMsgFormUrl(pullRequests.url))
  .then((res) => {
    try {
      const baseMsg = {
        user: res.base.repo.owner.login,
        repo: res.base.repo.name,
        path: 'package.json',
        ref: res.base.ref,
      };
      const headMsg = {
        user: res.head.repo.owner.login,
        repo: res.head.repo.name,
        path: 'package.json',
        ref: res.head.ref,
      };
      return Promise.all([getContent(baseMsg), getContent(headMsg)]);
    } catch (e) {
      throw new Error('Github Invalid Request');
    }
  })
  .then((results) => {
    const baseRes = results[0];
    const headRes = results[1];
    const basePackageJson = JSON.parse(new Buffer(baseRes.content, 'base64').toString());
    const headPackageJson = JSON.parse(new Buffer(headRes.content, 'base64').toString());
    headPackageJson.version = bumpVersion(masks, basePackageJson.version);
    const msg = getBranchMsgFormHtmlUrl(headRes.html_url);
    msg.path = 'package.json';
    msg.message = `version: v${basePackageJson.version} bump to v${headPackageJson.version}`;
    msg.content = new Buffer(JSON.stringify(headPackageJson, null, '  ')).toString('base64');
    msg.sha = headRes.sha;
    return updateFile(msg);
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err.message && err.stack));
}

module.exports = issueCommentHandler;
