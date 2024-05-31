const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URL;

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
    await client.connect();
    const watchesCollection = client.db("watchDB").collection("watches");

    // ================GET METHOD
    app.get("/watch", async (req, res) => {
      try {
        const watches = await watchesCollection.find().toArray();
        res.status(200).send(watches);
      } catch (error) {
        res.status(500).send(`"Fariled to fetch watches :${error}`);
      }
    });

    // SINGLE DATA GET METHOD

    app.get("/watch/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const watches = await watchesCollection.findOne({
          _id: new ObjectId(id),
        });
        res.status(200).send(watches);
      } catch (error) {
        res.status(500).send(`"Fariled to fetch watches :${error}`);
      }
    });

    // POSR MERHOD WATCH ROUTE LIST

    app.post("/watch", async (req, res) => {
      try {
        const watchesData = req.body;
        const result = await watchesCollection.insertOne(watchesData);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send(`'Failed to add user :${error}`);
      }
    });

    // UPDATE METHOD
    app.put("/watch/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateWatches = req.body;
        const result = await watchesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateWatches }
        );
        if (result.matchedCount === 1) {
          res.status(200).send({ message: "User update successfully" });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to update user " });
      }
    });

    // DELETE METHOD
    app.delete("/watch/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // const query = { _id: new ObjectId(id) };
        const result = await watchesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 1) {
          res.status(200).send({ message: "User deleted successfull" });
        } else {
          res.status(404).send({ error: "User not found" });
        }
      } catch (error) {
        res.status(500).send({ error: "Failed to delete user" });
      }
    });

    app.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.error("Failed to connect to MongoDB", error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server running");
});
