import test from "node:test";
import assert from "node:assert/strict";
import { getCountdown, WEDDING_DAY } from "../countdown.mjs";

test("Wedding day begins at 18:30 UTC on 12 December, regardless of visitor timezone", () => {
  assert.equal(WEDDING_DAY, Date.parse("2026-12-12T18:30:00Z"));
  assert.deepEqual(getCountdown(Date.parse("2026-12-11T17:28:57Z")), {
    days: 1,
    hours: 1,
    minutes: 1,
    seconds: 3,
    complete: false,
  });
});
test("Last second before the wedding remains a countdown", () => {
  assert.equal(getCountdown(WEDDING_DAY - 1000).seconds, 1);
  assert.equal(getCountdown(WEDDING_DAY - 1).complete, false);
});
test("At and after the date the countdown stops without negative values", () => {
  for (const now of [WEDDING_DAY, WEDDING_DAY + 86400000]) {
    assert.deepEqual(getCountdown(now), {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      complete: true,
    });
  }
});
