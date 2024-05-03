import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Pong!'),
  execute: async (client: Client, interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(`Pong! Took ${ping}ms to respond.`);
  },
};
