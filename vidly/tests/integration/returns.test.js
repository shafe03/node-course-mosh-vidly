const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
const request = require("supertest");

describe("/api/returns", () => {
  let server;
  let rental, customerId, movie1Id, movie2Id;

  beforeEach(async () => {
    server = require("../../index");
    customerId = new mongoose.Types.ObjectId();
    movie1Id = new mongoose.Types.ObjectId();
    movie2Id = new mongoose.Types.ObjectId();
    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "123456789"
      },
      movies: [
        {
          _id: movie1Id,
          title: "movie 1 title",
          dailyRentalRate: 2
        },
        {
          _id: movie2Id,
          title: "movie 2 title",
          dailyRentalRate: 3
        }
      ],
      days: 3
    });
    await rental.save();
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
  });

  it("should return 401 if client is not logged in", async () => {
    const res = await request(server)
      .post("/api/returns")
      .send({ customerId: customerId, rentalId: rental._id });
    expect(res.status).toBe(401);
  });

  it("should return 400 if customerId is not provided", async () => {
    const token = User().generateAuthToken();
    const res = await request(server)
      .post("/api/returns")
      .send({ rentalId: rental._id })
      .set("x-auth-token", `${token}`);
    expect(res.status).toBe(400);
    expect(res.text).toContain("required");
  });

  it("should return 400 if rentalId is not provided", async () => {
    const res = await request(server)
      .post("/api/returns")
      .send({ customerId: customerId });
    expect(res.status).toBe(400);
    expect(res.text).toContain("required");
  });
});

// POST /api/returns (customerId, rentalId)

// Return 404 if customerId is not valid
// Return 404 if rentalId is not valid
// Return 400 if rental has already been returned
// Return 200 if valid request
// Set the return date
// Calculate the rental fee
// Increase the stock
// Return the rental
