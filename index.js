const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

const uri = `mongodb+srv://${process.env.KEY}:${process.env.KEY}@cluster0.rth5hqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const usersCollection = client.db("connectSphere").collection("allUsers");
    const forumPostsCollection = client
      .db("connectSphere")
      .collection("forumPosts");

    app.post("/users", async (req, res) => {
      const userData = req.body;
      const query = { email: userData.email };
      const existingEmail = await usersCollection.findOne(query);
      if (existingEmail) {
        return res
          .status(400)
          .send({ message: "already exist!", insertedId: null });
      }
      const result = await usersCollection.insertOne(userData);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/forum-posts", async (req, res) => {
      const sortBy = req.query.sortBy || "time";
      const sortOrder =
        sortBy === "popularity" ? { voteCount: -1 } : { time: -1 };
      const result = await forumPostsCollection
        .aggregate([
          {
            $addFields: {
              voteCount: { $subtract: ["$upvotes", "$downvotes"] },
            },
          },
          {
            $sort: sortOrder,
          },
        ])
        .toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log("all ok");
});
