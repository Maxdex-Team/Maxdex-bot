const {
  CommandInteraction,
  CommandInteractionOptionResolver,
  ApplicationCommandOptionType,
} = require("discord.js");
const Client = require("../../../structures/Client");

module.exports = {
  name: "spawn",
  description: "Spawn a ball!",
  options: [
    {
      name: "ball",
      description: "The countryball to spawn",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  run: async (client, interaction, options) => {
    await interaction.deferReply({ ephemeral: true });
    const ball = options.getString("ball");
    await client.spawn(interaction, ball, interaction.channel);
  },
};
