const {
  ActivityType,
} = require("discord.js");
const client = require("../index");
const balls = require("../data/balls.json");

//READY
client.on("ready", async () => {
  console.log(client.user.username + " is online!");

  client.user.setActivity({
    name: "with country balls!",
    type: ActivityType.Streaming,
  });

  const ch = client.channels.cache.get("1109860975659716718");
  setInterval(async () => {
    await client.spawn(null, ch);
  }, 1000 * 60 * 15);
});
