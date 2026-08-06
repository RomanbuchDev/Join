'use strict';

const { strict: assert } = require('node:assert');
const { test } = require('node:test');
const { countLines } = require('./check-file-length.cjs');

test('zählt Unix- und Windows-Zeilenumbrüche', () => {
  assert.equal(countLines('eins\nzwei\ndrei'), 3);
  assert.equal(countLines('eins\r\nzwei'), 2);
});


test('eine leere Datei hat null Zeilen', () => {
  assert.equal(countLines(''), 0);
});
