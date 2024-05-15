import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('bongo')
    .setDescription('A wild Infex Bongo appears!'),
  execute: async (client: Client, interaction: ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
      .setTitle('A wild Infex Bongo appears!')
      .setDescription("Infex's tapping real speedy!")
      .setColor('Red')
      .setImage(
        'https://cdn.discordapp.com/attachments/1232057645683183629/1232107058082615407/infex-bongo.gif?ex=6628409e&is=6626ef1e&hm=b5f0909fd1adcc29b85900659566f9079c5cfed45eb1b03843f69c6a69327391&'
      );

    interaction.reply({ embeds: [embed] });
  },
};
