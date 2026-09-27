const assert = require("node:assert/strict");
const { test } = require("node:test");

const auth = require("../validations/auth.ts");
const registration = require("../validations/registration.ts");
const marketplace = require("../validations/marketplace.ts");
const orders = require("../validations/orders.ts");
const notifications = require("../validations/notifications.ts");
const { hashPassword, verifyPassword } = require("../lib/password.ts");

test("login validation normalizes email, strips unknown fields and bounds bcrypt input", async () => {
  const parsed = await auth.loginSchema.validate({
    email: "  PERSON@EXAMPLE.EDU ",
    password: "correct horse battery",
    role: "SUPER_ADMIN",
  }, { stripUnknown: true });
  assert.equal(parsed.email, "person@example.edu");
  assert.equal("role" in parsed, false);
  await assert.rejects(
    auth.loginSchema.validate({ email: "person@example.edu", password: "short" })
  );
  await assert.rejects(
    auth.loginSchema.validate({ email: "person@example.edu", password: "é".repeat(37) })
  );
});

test("registration rejects unsafe verification URLs and malformed identity data", async () => {
  const valid = {
    name: "Student Name", fatherName: "Parent Name", email: "student@example.edu",
    phone: "+92 300 1234567", password: "a secure password", studentId: "S-1",
    department: "Computing", program: "BS", semester: "1", section: "A",
  };
  assert.equal((await registration.studentRegistrationSchema.validate(valid)).email, "student@example.edu");
  await assert.rejects(registration.studentRegistrationSchema.validate({ ...valid, studentCardUrl: "javascript:alert(1)" }));
  await assert.rejects(registration.canteenOwnerRegistrationSchema.validate({
    name: "Owner Name", fatherName: "Parent Name", cnic: "invalid", phone: "1234567",
    email: "owner@example.edu", password: "a secure password", canteenName: "Cafe",
    description: "A campus cafe", location: "Campus", building: "A", openingTime: "09:00",
    closingTime: "18:00",
  }));
});

test("marketplace and order validators reject invalid ranges and status values", async () => {
  await assert.rejects(marketplace.productInputSchema.validate({ name: "Bad", description: "x", category: "0123456789abcdef01234567", price: -1, stockQuantity: 0, preparationTime: 5 }));
  await assert.rejects(marketplace.marketplaceQuerySchema.validate({ canteenId: "not-an-object-id" }));
  await assert.rejects(orders.orderStatusSchema.validate({ status: "NOT_A_STATUS" }));
  await assert.rejects(orders.cancelOrderSchema.validate({ status: "PENDING" }));
});

test("notification pagination is bounded and defaults safely", async () => {
  const parsed = await notifications.notificationPaginationSchema.validate({});
  assert.equal(parsed.page, 1);
  assert.equal(parsed.limit, 20);
  await assert.rejects(notifications.notificationPaginationSchema.validate({ limit: "1000" }));
});

test("password hashes verify without exposing the plaintext", async () => {
  const password = "a secure password";
  const hash = await hashPassword(password);
  assert.notEqual(hash, password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("incorrect password", hash), false);
});
