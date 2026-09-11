import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canBrokerReview,
  canClientUpload,
  caseNeedsAttention,
  isOverdue,
  statusAfterClientUpload,
} from "../lib/status";
import { caseIsOverdue } from "../lib/reminders";

test("client can upload needed or rejected items only", () => {
  assert.equal(canClientUpload("needed"), true);
  assert.equal(canClientUpload("rejected_resubmit"), true);
  assert.equal(canClientUpload("uploaded"), false);
  assert.equal(canClientUpload("accepted"), false);
  assert.equal(statusAfterClientUpload("needed"), "uploaded");
  assert.equal(statusAfterClientUpload("accepted"), null);
});

test("broker can review uploaded or needs_review items", () => {
  assert.equal(canBrokerReview("uploaded"), true);
  assert.equal(canBrokerReview("needs_review"), true);
  assert.equal(canBrokerReview("needed"), false);
});

test("review queue uses uploaded and needs_review", () => {
  assert.equal(caseNeedsAttention(["needed", "uploaded"]), true);
  assert.equal(caseNeedsAttention(["accepted", "needed"]), false);
});

test("overdue requires a past due date and outstanding items", () => {
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  assert.equal(isOverdue(yesterday), true);
  assert.equal(isOverdue(tomorrow), false);
  assert.equal(
    caseIsOverdue({ dueAt: yesterday }, [{ status: "needed" }]),
    true,
  );
  assert.equal(
    caseIsOverdue({ dueAt: yesterday }, [{ status: "accepted" }]),
    false,
  );
  assert.equal(
    caseIsOverdue({ dueAt: tomorrow }, [{ status: "needed" }]),
    false,
  );
});
