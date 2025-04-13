import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app, server } from "../src/index";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

describe("Authentication Tests", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    if (server && server.close) {
        server.close();
      }
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should not register a user with an existing email", async () => {
    await prisma.user.create({
      data: {
        name: "Existing User",
        email: "existing@example.com",
        password: "hashedpassword",
      },
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "New User",
      email: "existing@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already in use");
  });

  it("should login a user with valid credentials", async () => {
    const password = "password123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        name: "Test User",
        email: "login@example.com",
        password: hashedPassword,
      },
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should reject login with incorrect password", async () => {
    await prisma.user.create({
      data: {
        name: "Test User",
        email: "wrongpassword@example.com",
        password: "hashedpassword",
      },
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrongpassword@example.com",
      password: "incorrectpassword",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
