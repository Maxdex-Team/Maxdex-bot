const {
  CommandInteraction,
  CommandInteractionOptionResolver,
} = require("discord.js");
const Client = require("../../../structures/Client");
const balls = require("../../../data/balls.json");

module.exports = {
  name: "completion",
  description: "View your completion!",
  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  run: async (client, interaction, options) => {
    await interaction.deferReply();
    const data = await client.getData(interaction.user.id);
    const owned = data ? data.balls : [];

    const mapped = balls.pager(20).map((a) => {
      return a
        .map((b) => {
          const emoji = client.emojis.cache
            .find((e) => e.name === b.emoji)
            .toString();

          return `${emoji} ${b.name} - ${
            owned.find((o) => o.name === b.name) ? "`✅`" : "`❌`"
          }`;
        })
        .join(" | ");
    });

    await client.pagination({
      interaction,
      array: mapped,
      limit: 10,
      joiner: "\n",
      embedData: {
        text: `BallsDex progression: **${(
          (owned.length * 100) /
          balls.length
        ).toFixed(2)}%**\n\`✅ = Owned || ❌ = Unowned\`\n`,
        author: {
          name: interaction.member.displayName,
          iconURL: interaction.user.displayAvatarURL(),
        },
      },
    });
  },
};
