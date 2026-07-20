import assert from 'node:assert/strict';
import test from 'node:test';

import {
  connectLenisTicker,
  shouldEnableSmoothScroll,
} from '../src/hooks/lenisLifecycle.js';

test('disables smooth scrolling for touch devices', () => {
  assert.equal(shouldEnableSmoothScroll(false, true), false);
  assert.equal(shouldEnableSmoothScroll(false, false), true);
  assert.equal(shouldEnableSmoothScroll(true, false), false);
});

test('removes the same callback that was added to the ticker', () => {
  let added;
  let removed;
  const rafCalls = [];
  const ticker = {
    add(callback) {
      added = callback;
    },
    remove(callback) {
      removed = callback;
    },
  };

  const disconnect = connectLenisTicker(
    { raf: time => rafCalls.push(time) },
    ticker,
  );

  assert.ok(added);
  added(1.25);
  assert.deepEqual(rafCalls, [1250]);

  disconnect();
  assert.equal(removed, added);
});
