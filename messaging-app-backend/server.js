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

const pusher = new Pusher({
  appId: "1948552",
  key: "5ae506e78bee62c643ca",
  secret: "6a2af2bebf2463d102d0",
  cluster: "us2",
  useTLS: true,
});

//Middleware
app.use(express.json());
app.use(Cors());

//DB Config
mongoose.connect(connection_url, {});

//API Endpoints
const db = mongoose.connection;
db.once("open", () => {
  console.log("DB connected");
  const msgCollection = db.collection("messagingmessages");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error trigerring Pusher");
    }
  });
});

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
