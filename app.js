'use strict';

const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const GithubWebhookHandler = require('koa-github-webhook-handler');
const issueCommentHandler = require('./lib/issue-comment-handler');
const app = koa();

const githubWebhookHandler = new GithubWebhookHandler({
  path: '/webhook',
  secret: process.env.SEANBOT_WEBHOOK_SECRET,
});

githubWebhookHandler.on('issue_comment', issueCommentHandler);

app.use(bodyParser({
  verify: (req, str) => {
    req.rawBody = str;
    console.log(str);
  },
}));

app.use(githubWebhookHandler.middleware());
app.listen((process.env.PORT || 4444));
