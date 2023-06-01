const {
  CommandInteraction,
  CommandInteractionOptionResolver,
} = require("discord.js");
const Client = require("../../structures/Client");

module.exports = {
  name: "help",
  description: "Help command!",
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  run: async (client, interaction, options) => {
    const commands = client.commands;

    const embed = client.makeEmbed({
      title: "Help!",
      text: "List of available commands!",
    });

    const categories = {};
    commands.forEach((cmd) => {
      const { category, name, description } = cmd;
      const arr = categories[category];
      let formatted = `\`${name.toLowerCase()}\` - ${description}`;
      if (arr) arr.push(formatted);
      else categories[category] = [formatted];
    });

    Object.entries(categories).forEach(([k, v]) => {
      embed.addFields([
        {
          name: `${k} »`,
          value: v.join("\n"),
        },
      ]);
    });

    return await interaction.reply({
      embeds: [embed],
    });
  },
};
