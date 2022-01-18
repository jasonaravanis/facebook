import request, { agent } from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import populateMockDatabase from "../../utils/populateMockDatabase";
import app from "../../app/app";

describe("/api/posts", () => {
  let mongoServer: MongoMemoryServer;
  let mockUserIds: string[];
  let mockPostIds: string[];
  let agent: any;
  agent = request.agent(app);
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  beforeEach(async () => {
    mongoose.connection.dropDatabase();
    ({ mockUserIds, mockPostIds } = await populateMockDatabase());
  });
  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
  describe("/newsfeed", () => {
    describe("if not logged in", () => {
      describe("GET", () => {
        test("asks client to login and retry", async () => {
          const response = await agent.get("/api/posts/newsfeed");
          expect(response.body).toMatchObject({
            message: "Please login to view this",
          });
        });
      });
    });
    describe("if logged in", () => {
      beforeEach(async () => {
        await agent
          .post("/login")
          .send({
            email: "steve@rogers.com",
            password: 12345,
          })
          .type("form");
      });
      describe("GET", () => {
        test("returns newsfeed posts for logged in user", async () => {
          const response = await agent.get("/api/posts/newsfeed");
          expect(response.body.length).toBe(3);
          // Steve and Peter are not friends (see populateMockDatabase)
          expect(response.body).not.toContainEqual(
            expect.objectContaining({
              content: "1st post by Peter",
            })
          );
        });
      });
    });
  });
  describe("/:pid", () => {
    describe("if not logged in", () => {
      describe("GET", () => {
        test("asks client to login and retry", async () => {
          const response = await agent.get(`/api/posts/${mockPostIds[0]}`);
          expect(response.body).toMatchObject({
            message: "Please login to view this",
          });
        });
      });
      describe("PUT", () => {
        test("asks client to login and retry", async () => {
          const newPostData = {
            content: "This is the newly updated post content",
          };

          const response = await agent
            .put(`/api/posts/${mockPostIds[0]}`)
            .send(newPostData);
          expect(response.body).toMatchObject({
            message: "Please login to view this",
          });
        });
      });
    });
    describe("if logged in", () => {
      beforeEach(async () => {
        await agent
          .post("/login")
          .send({
            email: "steve@rogers.com",
            password: 12345,
          })
          .type("form");
      });
      describe("GET", () => {
        describe("if invalid pid", () => {
          test("returns 400 error", async () => {
            const response = await agent.get("/api/posts/INVALID_PID");
            expect(response.body.errors.length).toBe(1);
            expect(response.statusCode).toBe(400);
          });
        });
        describe("if valid pid", () => {
          test("returns post", async () => {
            const response = await agent.get(`/api/posts/${mockPostIds[0]}`);
            expect(response.body).toMatchObject({
              content: "1st post by Steve",
            });
          });
        });
        describe("if valid pid but post does not exist", () => {
          test("returns 404 error", async () => {
            const idOfNonExistantPost = new mongoose.Types.ObjectId();
            const response = await agent.get(
              `/api/posts/${idOfNonExistantPost}`
            );
            expect(response.statusCode).toBe(404);
          });
        });
      });
      describe("PUT", () => {
        describe("if invalid pid", () => {
          test("returns 400 error", async () => {
            const newPostData = {
              content: "This is the newly updated post content",
            };
            const response = await agent
              .put("/api/posts/INVALID_PID")
              .send(newPostData);
            expect(response.body.errors.length).toBe(1);
            expect(response.statusCode).toBe(400);
          });
        });
        describe("if valid pid", () => {
          test("returns updated post", async () => {
            const newPostData = {
              content: "This is the newly updated post content",
            };

            const response = await agent
              .put(`/api/posts/${mockPostIds[0]}`)
              .send(newPostData);
            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(expect.objectContaining(newPostData));
          });
        });
      });
    });
  });
});