import assert from "node:assert/strict";
import { test } from "node:test";
import { isSampleLabel, labelSampleClient } from "../lib/sample-label";

test("prefixes ordinary names with SAMPLE Client", () => {
  assert.equal(labelSampleClient("Alex Taylor"), "SAMPLE Client — Alex Taylor");
});

test("keeps an existing SAMPLE label", () => {
  assert.equal(
    labelSampleClient("SAMPLE Client — Priya Nair"),
    "SAMPLE Client — Priya Nair",
  );
});

test("treats blank names as unnamed samples", () => {
  assert.equal(labelSampleClient("   "), "SAMPLE Client — Unnamed");
  assert.equal(isSampleLabel("SAMPLE Client — Tom"), true);
  assert.equal(isSampleLabel("Tom Brennan"), false);
});
