import express from "express";
import mongoose from "mongoose";
import Cors from "cors";
import Messages from "./dbMessages.js";
import Pusher from "pusher";

//App Config
const app = express();
const port = process.env.PORT || 9000;

const connection_url =
  "mongodb+srv://dougscheible:fossil69@cluster1.2l0ue.mongodb.net/messagingDB?retryWrites=true&w=majority";

//Middleware
app.use(express.json());
app.use(Cors());

//DB Config
mongoose.connect(connection_url, {});

//API Endpoints
app.get("/", (req, res) => res.status(200).send("Hello TheWebDev"));

app.get("/messages/sync", async (req, res) => {
  try {
    const data = await Messages.find();
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/messages/new", async (req, res) => {
  const messages = req.body;
  Messages.create(messages)
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.send(err);
    });
});

//Listener
app.listen(port, () => console.log(`Listening on localhost: ${port}`));
