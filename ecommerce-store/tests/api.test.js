/**
 * Backend API tests for auth, orders, and products endpoints using Jest and supertest
 */

const request = require("supertest");
const app = require("../server"); // Assuming server.js exports the Express app

describe("Auth API", () => {
  let testUser = {
    name: "Test User",
    email: "testuser@example.com",
    password: "TestPass123",
  };

  test("POST /api/auth/register - success", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(testUser.email);
  });

  test("POST /api/auth/register - duplicate user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test("POST /api/auth/login - success", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("POST /api/auth/login - invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "WrongPass" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});

// Additional tests for orders and products would follow here...
