'use strict';

const test = require('tape');
const parseCommentBody = require('../lib/utils').parseCommentBody;

test('utils.parseCommentBody', function(t) {
  t.equal(parseCommentBody('@seanbot bump'), null);
  t.deepEqual(parseCommentBody('@seanbot bump major'), [1, 0, 0]);
  t.deepEqual(parseCommentBody('@seanbot bump minor'), [0, 1, 0]);
  t.deepEqual(parseCommentBody('@seanbot bump patch'), [0, 0, 1]);
  t.deepEqual(parseCommentBody('@sanbot bmp msjor'), [1, 0, 0]);
  t.deepEqual(parseCommentBody('@senbot bup mimor'), [0, 1, 0]);
  t.deepEqual(parseCommentBody('@seanot dump patxh'), [0, 0, 1]);
  t.end();
});
