const client = require("../index");

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const sub = interaction.options.getSubcommand(false);
    const { commandName, options } = interaction;
    const command = sub
      ? client.commands.get(sub)
      : client.commands.get(commandName) ||
        client.commands.find(
          (cm) => cm.aliases && cm.aliases.includes(commandName)
        );

    if (!command) return;
    // if (!command.defer) await interaction.deferReply().catch((e) => null);
    command.run(client, interaction, options);
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === "cmodal") {
      const { customId, value } = interaction.fields.fields.find((f) =>
        f.customId.startsWith("cguess")
      );

      const answer = customId.split("-")[1];
      if (value.toLowerCase() === answer) {
        await client.addBall(
          interaction.user.id,
          interaction.user.username,
          answer
        );
        await interaction.reply(
          `${interaction.user} successfully caught the countryball!!`
        );
      } else
        await interaction.reply({
          content: "Incorrect guess!",
          ephemeral: true,
        });
    }
  }
});
