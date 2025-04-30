import express from "express";
import cors from "cors";
import { API_KEY } from "./constants";
import { podcastRouter } from "./routes/podcast.routes";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", podcastRouter)

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

