const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;
const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://b9a12-server-side-ruhulamin-2024.vercel.app",
      "https://assignment12-60ec2.web.app",
    ],
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

const verifyUserToken = (req, res, next) => {
  const authorizationUserToken = req.headers.authorization;
  if (!authorizationUserToken) {
    return res.status(401).send({
      message: "not authorized!",
    });
  }
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.USER_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decodedUserToken = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const usersCollection = client.db("connectSphere").collection("allUsers");
    const forumPostsCollection = client
      .db("connectSphere")
      .collection("forumPosts");

    const announcementsCollection = client
      .db("connectSphere")
      .collection("announcementData");
    const tagsCollection = client.db("connectSphere").collection("allTags");

    const verifyAdminRole = async (req, res, next) => {
      const email = req.decodedUserToken.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdminRole = user?.role === "admin";
      if (!isAdminRole) {
        return res.status(403).send({ message: "forbidden access!" });
      }
      next();
    };
    app.post("/jwt-login", async (req, res) => {
      const userData = req.body;
      const userTokenData = jwt.sign(userData, process.env.USER_SECRET_TOKEN, {
        expiresIn: process.env.USER_EXPIRED_DATR,
      });
      res.send({ userTokenData });
    });
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
    app.get("/users", verifyUserToken, verifyAdminRole, async (req, res) => {
      const page = parseInt(req.query.page);
      const result = await usersCollection
        .find()
        .skip(page * 5)
        .limit(5)
        .toArray();
      res.send(result);
    });
    app.get("/forum-posts-count", async (req, res) => {
      const result = await forumPostsCollection.countDocuments();
      res.send({ count: result });
    });
    app.get(
      "/my-recent-forum-posts/:email",
      verifyUserToken,
      async (req, res) => {
        const email = req.params.email;
        const query = { authorEmail: email };
        const result = await forumPostsCollection
          .find(query)
          .limit(3)
          .toArray();
        res.send(result);
      }
    );
    app.get("/forum-posts", async (req, res) => {
      const sortBy = req.query.sortBy || "time";
      const page = parseInt(req.query.page);
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
        .skip(page * 5)
        .limit(5)
        .toArray();
      res.send(result);
    });
    app.get(
      "/forum-post-data-count/:email",
      verifyUserToken,
      async (req, res) => {
        const email = req.params.email;
        const query = { authorEmail: email };
        const result = await forumPostsCollection.countDocuments(query);
        res.send({ count: result });
      }
    );
    app.get("/check-user-badge/:email", verifyUserToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      if (result.badge === "gold") {
        return res.send({ isMember: true });
      } else {
        return res.send({ isMember: false });
      }
    });
    app.post("/forum-post-data", async (req, res) => {
      const forumPostData = req.body;
      const result = await forumPostsCollection.insertOne(forumPostData);
      res.send(result);
    });
    app.get("/forum-posts-detailes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await forumPostsCollection.findOne(query);
      res.send(result);
    });
    app.post("/create-membership-intent", async (req, res) => {
      const { membershipfee } = req.body;
      const membershipfeeInt = parseInt(membershipfee * 100);
      const membershipIntent = await stripe.paymentIntents.create({
        amount: membershipfeeInt,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: membershipIntent.client_secret,
      });
    });
    app.patch("/get-gold-badge/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const updateBadge = {
        $set: { badge: "gold" },
      };
      const result = await usersCollection.updateOne(query, updateBadge);
      res.send(result);
    });
    app.get("/users-admin-role/:email", verifyUserToken, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decodedUserToken.email) {
        return res.status(401).send({
          message: "not authorized!",
        });
      }
      const query = { email: email };
      const result = await usersCollection.findOne(query);

      if (result?.role === "admin") {
        return res.send(true);
      }

      return res.send(false);
    });
    app.get("/my-forum-posts/:email", verifyUserToken, async (req, res) => {
      const email = req.params.email;
      const page = parseInt(req.query.page);
      const query = { authorEmail: email };
      const result = await forumPostsCollection
        .find(query)
        .skip(page * 5)
        .limit(5)
        .toArray();
      res.send(result);
    });
    app.delete("/forum-posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await forumPostsCollection.deleteOne(query);
      res.send(result);
    });
    app.get(
      "/my-forum-posts-count/:email",
      verifyUserToken,
      async (req, res) => {
        const email = req.params.email;
        const query = { authorEmail: email };
        const result = await forumPostsCollection.countDocuments(query);
        res.send({ count: result });
      }
    );
    app.get(
      "/users-admin-profile/:email",
      verifyUserToken,
      verifyAdminRole,
      async (req, res) => {
        const email = req.params.email;
        const query = { email: email, role: "admin" };
        const result = await usersCollection.findOne(query);
        res.send(result);
      }
    );
    app.get(
      "/number-of-forum-posts",
      verifyUserToken,
      verifyAdminRole,
      async (req, res) => {
        const result = await forumPostsCollection.countDocuments();
        res.send({ count: result });
      }
    );
    app.get(
      "/number-of-users",
      verifyUserToken,
      verifyAdminRole,
      async (req, res) => {
        const result = await usersCollection.countDocuments();
        res.send({ count: result });
      }
    );
    app.put(
      "/users-make-admin/:email",
      verifyUserToken,
      verifyAdminRole,
      async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const updateRole = {
          $set: { role: "admin" },
        };
        // const options = { upsert: true };
        const result = await usersCollection.updateOne(query, updateRole);
        res.send(result);
      }
    );
    app.post(
      "/announcements-post",
      verifyUserToken,
      verifyAdminRole,
      async (req, res) => {
        const announcementData = req.body;
        const result = await announcementsCollection.insertOne(
          announcementData
        );
        res.send(result);
      }
    );
    app.get(
      "/users-count",
      verifyUserToken,
      verifyAdminRole,
      async (req, res) => {
        const result = await usersCollection.countDocuments();
        res.send({ count: result });
      }
    );
    app.get("/annoucements", async (req, res) => {
      const result = await announcementsCollection.find().toArray();
      res.send(result);
    });
    app.get("/annoucements-count", async (req, res) => {
      const result = await announcementsCollection.countDocuments();
      res.send({ count: result });
    });
    app.post(
      "/add-tags",
      verifyUserToken,
      verifyAdminRole,
      async (req, res) => {
        const tagsData = req.body;
        const existingTag = await tagsCollection.findOne({
          tag: tagsData.tag,
        });
        if (existingTag) {
          return res.send({ message: "Tag already exists" });
        }
        const result = await tagsCollection.insertOne(tagsData);
        res.send(result);
      }
    );
    app.get("/all-tags", async (req, res) => {
      const result = await tagsCollection.find().toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
