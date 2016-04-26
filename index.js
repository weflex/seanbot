'use strict';

const koa = require('koa');
const koaBody = require('koa-body');
const GithubWebhookHandler = require('koa-github-webhook-handler');
const github = require('./lib/github');
const bumpVersion = require('semver-increment');
const promisify = require('es6-promisify');

const app = koa();

const githubWebhookHandler = new GithubWebhookHandler({
  path: '/webhook',
  secret: process.env.SEANBOT_WEBHOOK_SECRET,
});

const getPullRequests = promisify(github.pullRequests.get.bind(github.pullRequests));
const getContent = promisify(github.repos.getContent.bind(github.repos));
const updateFile = promisify(github.repos.updateFile.bind(github.repos));

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

function getMsgFormPrUrl(url) {
  const list = url.split('/');
  return {
    user: list[4],
    repo: list[5],
    number: list[7],
  };
}

function getMsgFormHtmlUrl(url) {
  const list = url.split('/');
  return {
    user: list[3],
    repo: list[4],
    branch: list[6],
  };
}

function issueCommentHandler(event) {
  const payload = event.payload;
  const pullRequests = payload.issue.pull_request;
  if (!pullRequests) {
    console.log('It isn\'t a pull request.');
    return;
  }
  const commentBody = payload.comment.body.toLowerCase();
  const masks = getMasksFromCommentBody(commentBody);
  if (!commentBody.match('@seanbot') || !commentBody.match('bump' || !masks)) {
    console.log(commentBody, 'It\'s not a bump action.');
    return;
  }
  getPullRequests(getMsgFormPrUrl(pullRequests.url))
  .then((res) => {
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
  })
  .then((results) => {
    const baseRes = results[0];
    const headRes = results[1];
    const basePackageJson = JSON.parse(new Buffer(baseRes.content, 'base64').toString());
    const headPackageJson = JSON.parse(new Buffer(headRes.content, 'base64').toString());
    headPackageJson.version = bumpVersion(masks, basePackageJson.version);
    const msg = getMsgFormHtmlUrl(headRes.html_url);
    msg.path = 'package.json';
    msg.message = `version: ${basePackageJson.version} bump to :version ${headPackageJson.version}`;
    msg.content = new Buffer(JSON.stringify(headPackageJson, null, '  ')).toString('base64');
    msg.sha = headRes.sha;
    return updateFile(msg);
  })
  .then((res) => console.log(res))
  .catch((err) => console.error(err.message && err.stack));
}

githubWebhookHandler.on('issue_comment', issueCommentHandler);

app.use(koaBody({
  formidable: {
    uploadDir: __dirname,
  },
}));

app.use(githubWebhookHandler.middleware());
app.listen((process.env.PORT || 4444));

exports.getMasksFromCommentBody = getMasksFromCommentBody;
exports.getMsgFormPrUrl = getMsgFormPrUrl;
exports.getMsgFormHtmlUrl = getMsgFormHtmlUrl;
exports.issueCommentHandler = issueCommentHandler;
