import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('owo')
    .setDescription("What's this?!"),
  execute: (client: Client, interaction: ChatInputCommandInteraction) => {
    interaction.reply("What's this?!");
  },
};
