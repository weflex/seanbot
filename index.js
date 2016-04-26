'use strict';

const koa = require('koa');
const koaBody = require('koa-body');
const GithubWebhookHandler = require('koa-github-webhook-handler');
const github = require('./github');
const bumpVersion = require('semver-increment');
const Promise = require('bluebird');

const app = koa();

const githubWebhookHandler = new GithubWebhookHandler({
  path: '/webhook',
  secret: process.env.SEANBOT_WEBHOOK_SECRET,
});

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

function getPullRequests(url) {
  return new Promise((resolve, reject) => {
    github.pullRequests.get(getMsgFormPrUrl(url), (err, res) => {
      if (err) {
        reject(err);
      }
      const msg = {
        user: res.head.repo.owner.login,
        repo: res.head.repo.name,
        path: 'package.json',
        ref: res.head.ref,
      };
      resolve(msg);
    });
  });
}

function getPackageJsonFromHeadRepo(msg) {
  return new Promise((resolve, reject) => {
    github.repos.getContent(msg, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

function updatePackageJsonToHeadRepo(masks, response) {
  return new Promise((resolve, reject) => {
    const content  = response.content;
    const _package = JSON.parse(new Buffer(content, 'base64').toString());
    _package.version = bumpVersion(masks, _package.version);
    const msg = getMsgFormHtmlUrl(response.html_url);
    github.repos.updateFile({
      user: msg.user,
      repo: msg.repo,
      path: 'package.json',
      branch: msg.branch,
      message: 'Bump version to ' + _package.version,
      content: new Buffer(JSON.stringify(_package, null, '  ')).toString('base64'),
      sha: response.sha,
    }, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

function worker(payload) {
  return new Promise((resolve, reject) => {
    const pullRequests = payload.issue.pull_request;
    if (!pullRequests) {
      reject(new Error('It isn\'t a pull request.'));
    }
    const commentBody = payload.comment.body.toLowerCase();
    if (commentBody.match('@seanbot') && commentBody.match('bump')) {
      const masks = getMasksFromCommentBody(commentBody);
      if (!masks) {
        reject(new Error('It isn\'t a bump action.'));
      }
      getPullRequests(pullRequests.url)
        .then(getPackageJsonFromHeadRepo)
        .then((msg, res) => {
          return updatePackageJsonToHeadRepo(masks, msg, res);
        })
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    }
  });
}

githubWebhookHandler.on('issue_comment', (event) => {
  worker(event.payload)
    .then((res) => console.log(res))
    .catch((err) => console.error(err.message && err.stack));
});

app.use(koaBody({
  formidable: {
    uploadDir: __dirname,
  },
}));

app.use(githubWebhookHandler.middleware());
app.listen((process.env.PORT || 4444));
