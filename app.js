'use strict';

const koa = require('koa');
const koaBody = require('koa-body');
const GithubWebhookHandler = require('koa-github-webhook-handler');
const issueCommentHandler = require('./lib/issue-comment-handler');
const app = koa();

const githubWebhookHandler = new GithubWebhookHandler({
  path: '/webhook',
  secret: process.env.SEANBOT_WEBHOOK_SECRET,
});

githubWebhookHandler.on('issue_comment', issueCommentHandler);

app.use(koaBody({
  formidable: {
    uploadDir: __dirname,
  },
}));

app.use(githubWebhookHandler.middleware());
app.listen((process.env.PORT || 4444));
