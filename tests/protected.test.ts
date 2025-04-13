import request from "supertest";
import { app } from "../src/index";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

describe("JWT Authentication Tests", () => {
  let token: string;

  beforeAll(async () => {
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "jwt@example.com",
        password: "hashedpassword",
      },
    });

    token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should reject access without a token", async () => {
    const res = await request(app).get("/api/auth/protected");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access denied. No token provided.");
  });

  it("should allow access with a valid token", async () => {
    const res = await request(app).get("/api/auth/protected").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("userId");
  });
});
