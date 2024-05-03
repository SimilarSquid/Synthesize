import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('beep').setDescription('Boop!'),
  execute: (client: Client, interaction: ChatInputCommandInteraction) => {
    interaction.reply('Boop!');
  },
};
