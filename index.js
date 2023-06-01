const fs = require("fs");
require("dotenv").config();
const Client = require("./structures/Client");

const client = new Client({
  intents: ["Guilds", "GuildMessages", "GuildMembers", "GuildVoiceStates"],
  partials: ["User", "Channel"],
});

module.exports = client;

Object.defineProperty(Array.prototype, "pager", {
  value: function (n) {
    return Array.from(Array(Math.ceil(this.length / n)), (_, i) =>
      this.slice(i * n, i * n + n)
    );
  },
});

//MONGODB
const mongo = require("mongoose");
mongo.connect(process.env.mongoUri).then(() => console.log("Connected to DB!"));

fs.readdirSync("./handler").forEach((file) => {
  require(`./handler/${file}`);
});

client.login(process.env.token);
