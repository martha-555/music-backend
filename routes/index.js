/** @format */

const axios = require("axios");
var express = require("express");
const { getInfo } = require("@distube/ytdl-core");

// const { getInfo } = require("ytdl-core");

var router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome!");
});

router.post("/", async function (req, res, next) {
  let result = null;
  console.log(req.body);

  if (req.body.type === "Mp3") {
    let { query, trackId, videoId } = req.body.payload;
    console.log({ query, trackId, videoId });

    if (!videoId) {
      try {
        videoId = await getFirstVideoId(query);
      } catch {
        res.send({ error: "Video id not found" });
        return;
      }
    }

    const mp3 = await getVideoMp3(videoId);

    res.send({
      data: {
        trackId,
        videoId,
        mp3,
      },
    });

    return;
  }
  console.log(req.body);
  const { url, method, body } = req.body.payload;

  let response = {};

  switch (method) {
    case "GET":
      response = await axios.get(url, { body });
      result = response.data;
      break;
    case "POST":
      response = await axios.post(url, { body });
      result = response.data;
      break;
    case "DELETE":
      response = await axios.delete(url, { body });
      result = response.data;
      break;
  }

  res.send(result);
});

const getFirstVideoId = async (query) => {
  const searchResponse = await axios.get(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  );

  const html = searchResponse.data;
  const matched = html.match(/watch\?v=(.*)\\"/gm);

  if (matched) {
    const stringWithId = matched[0].split('"')[0];
    const id = stringWithId.slice(stringWithId.indexOf("=") + 1);
    return id;
  }

  throw new Error("Video id not found");
};

// const getVideoMp3 = async (id) => {
//   const response = await getInfo(`http://www.youtube.com/watch?v=${id}`);
//   const targetFormat = response.formats.filter(
//     (format) => format.itag === 140
//   )[0];

//   return targetFormat.url;
// };

const ytdl = require("@distube/ytdl-core");

const getVideoMp3 = async (id) => {
  const response = await ytdl.getInfo(`http://www.youtube.com/watch?v=${id}`);
  const targetFormat = response.formats.find((format) => format.itag === 140);

  return targetFormat ? targetFormat.url : null;
};

module.exports = router;
