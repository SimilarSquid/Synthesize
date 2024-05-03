import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('shiba').setDescription('Inu!'),
  execute: (client: Client, interaction: ChatInputCommandInteraction) => {
    interaction.reply('Inu!');
  },
};
