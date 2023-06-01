const chalk = require("chalk");
const fs = require("fs");
const { readdirSync } = fs;
const client = require("../index");
const { ApplicationCommandOptionType } = require("discord.js");

const commands = [];

const getCommand = (dir, cmd) => {
  const file = require(`../commands/${dir}/${cmd}`);
  const name = file.name || "No command name.";
  const description = file.description || "No description.";
  file.category = dir.split("/")[1];

  const data = {
    name,
    description,
    options: file.options,
  };

  const option = name === "No command name." ? "❌" : "✅";
  console.log(`Loaded Slash Command ${option} | ${name}`);

  return {
    data,
    file,
    option,
  };
};

//SLASH COMMANDS
console.log(chalk.blue.bold("SLASH COMMANDS 🟢"));
readdirSync("./commands").forEach(async (dir) => {
  const cmds = readdirSync(`./commands/${dir}/`);

  cmds.forEach((cmd) => {
    if (!cmd.endsWith(".js")) {
      const scmds = readdirSync(`./commands/${dir}/${cmd}`);
      const subs = scmds.map((s) => {
        const { option, data, file } = getCommand(`${dir}/${cmd}`, s);
        if (option === "✅") {
          client.commands.set(data.name, file);
          return {
            ...data,
            type: ApplicationCommandOptionType.Subcommand,
          };
        }
      });

      commands.push({
        name: cmd,
        description: `${cmd} command`,
        options: subs,
      });
    } else {
      const { option, data, file } = getCommand(dir, cmd);
      if (option === "✅") {
        client.commands.set(data.name, file);
        commands.push(data);
      }
    }
  });
});

client.on("ready", async () => {
  await client.application.commands.set(commands);
  console.log(chalk.green.blue.bold("Commands set!"));
});

console.log("-".repeat(30));

//EVENTS
console.log(chalk.yellow.bold("EVENTS 🟢"));
readdirSync("./events").forEach(async (event) => {
  const eventName = event.replace(".js", "");
  require(`../events/${event}`);
  console.log("Loaded Event ✅ | " + eventName);
});

console.log("-".repeat(30));
