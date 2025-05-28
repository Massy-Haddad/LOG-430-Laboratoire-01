// test/sample.test.cjs
const { describe, it, expect } = require('@jest/globals');

describe('Math test', () => {
  it('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });
});
