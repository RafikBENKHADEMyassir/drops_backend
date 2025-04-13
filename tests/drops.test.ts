import request from "supertest";
import { app, server } from "../src/index";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

describe("Drop Tests", () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // ✅ First, delete drops (to avoid FK errors)
    await prisma.drop.deleteMany();
  
    // ✅ Then, delete users
    await prisma.user.deleteMany();
  
    // ✅ Create a user first
    const user = await prisma.user.create({
      data: {
        name: "Drop Tester",
        email: "drop@test.com",
        password: "hashedpassword",
      },
    });
    console.log("Created user ID:", user.id);
    // ✅ Generate JWT with valid userId
    token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
  });
  

  afterAll(async () => {
    await prisma.$disconnect();
    if (server && server.close) {
      server.close();
    }
  });

  it("should create a new drop", async () => {
    const res = await request(app)
      .post("/api/drops")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "digital",
        title: "Test Drop",
        content: "https://example.com/media.jpg",
        location: "37.7749,-122.4194",
      });
console.log(res.body)
    expect(res.status).toBe(201);
    // expect(res.body).toHaveProperty("id");
    // expect(res.body.title).toBe("Test Drop");
  });

//   it("should fetch all drops for the user", async () => {
//     const res = await request(app)
//       .get("/api/drops")
//       .set("Authorization", `Bearer ${token}`);

//     expect(res.status).toBe(200);
//     expect(res.body.length).toBeGreaterThan(0);
//   });
});
