const {
  Client,
  Collection,
  EmbedBuilder,
  ClientOptions,
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
  ButtonStyle,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle,
} = require("discord.js");
const db = require("../models/User");
const balls = require("../data/balls.json");

class MainClient extends Client {
  /**
   *
   * @param {ClientOptions} params
   */
  constructor(params) {
    super(params);
    this.commands = new Collection();
  }

  makeEmbed({ title, text, img, reason, author }) {
    const embed = new EmbedBuilder().setColor("#EE1B24");

    switch (reason) {
      case "warn":
        embed.setColor("Yellow");
        break;
      case "error":
        embed.setColor("Red");
        break;
    }

    if (title) embed.setTitle(title);
    if (text) embed.setDescription(text);
    if (author) embed.setAuthor(author);
    if (img) embed.setImage(img);
    return embed;
  }

  /**
   *
   * @param {String} userId
   */
  async getData(userId) {
    const data = await db.findOne({
      id: userId,
    });

    if (!data) return;
    return data;
  }

  /**
   *
   * @param {String} userId
   * @param {db} details
   * @param {Boolean} update
   */
  async saveData(userId, details, update) {
    if (update)
      return await db.findOneAndUpdate(
        {
          id: userId,
        },
        details
      );

    await db.create({
      id: userId,
      ...details,
    });
  }

  /**
   *
   * @param {String} id
   * @param {String} ball
   * @param {String} name
   */
  async addBall(id, name, ball) {
    const data = await db.findOne({
      id,
    });

    const findBall = balls.find((b) => b.name.toLowerCase() === ball);
    if (!findBall) return;

    if (data) {
      data.balls.push({
        name: findBall.name,
      });
      data.save();
    } else {
      await db.create({
        id,
        username: name,
        balls: [
          {
            name: findBall.name,
          },
        ],
      });
    }
  }

  /**
   *
   * @param {{
   *  interaction: CommandInteraction,
   *  array: [],
   *  limit: Number,
   *  embedData: any,
   *  joiner: String
   * }} options
   */
  async pagination({ interaction, array, limit, embedData, joiner }) {
    const pages = array.pager(limit || 10);
    const embeds = pages.map((p, i) => {
      return this.makeEmbed({
        ...embedData,
        text: `${embedData.text}\n${p.join(joiner || "\n")}`,
      }).setFooter({
        text: `Page: ${i + 1}/${pages.length} (${array.length} entries)`,
      });
    });

    let page = 0;
    const row = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("⬅️")
        .setStyle("Danger")
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle("Primary"),
    ]);

    const msg = await interaction.followUp({
      embeds: [embeds[page]],
      components: embeds.length > 1 ? [row] : [],
      fetchReply: true,
    });

    if (embeds.length < 2) return;

    const collector = msg.createinteractionComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      idle: 15000,
    });

    collector.on("collect", async (i) => {
      console.log(i.user.username);
      await i.deferUpdate();

      if (i.customId === "prev")
        page === 0 ? (page = embeds.length - 1) : --page;
      else page === embeds.length - 1 ? (page = 0) : ++page;

      if (page === embeds.length - 1) {
        row.components[1].setDisabled(true);
        row.components[0].setDisabled(false);
      } else if (page === 0) {
        row.components[0].setDisabled(true);
        row.components[1].setDisabled(false);
      } else row.components.forEach((c) => c.setDisabled(false));

      return await msg.edit({
        embeds: [embeds[page]],
        components: [row],
      });
    });
  }

  async spawn(int, b, ch) {
    const filtered = balls.filter((b) => b.img);
    const randomb = b
      ? filtered.find((f) => f.name.toLowerCase() === b.toLowerCase())
      : filtered[Math.floor(Math.random() * filtered.length)];

    if (!randomb)
      return await int.followUp({
        content: "Countryball does not exist!",
        ephemeral: true,
      });

    const msg = await ch.send({
      content: "A wild countryball appeared!",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("catch")
            .setLabel("Catch me!")
            .setStyle(ButtonStyle.Primary)
        ),
      ],
      files: [new AttachmentBuilder(randomb.img, randomb.name)],
    });

    await int.followUp({
      content: "Successfully Spawned!",
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => !i.user.bot,
      time: 1000 * 60 * 5,
      max: 1,
    });

    collector.on("collect", async (i) => {
      const modal = new ModalBuilder()
        .setCustomId("cmodal")
        .setTitle("Catch this countryball!")
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId(`cguess-${randomb.name.toLowerCase()}`)
              .setLabel("Name of the country")
              .setPlaceholder("Your guess")
              .setRequired(true)
              .setStyle(TextInputStyle.Short)
          )
        );

      await i.showModal(modal);
    });
  }
}

module.exports = MainClient;
