import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from 'discord.js';

export type Command = {
  data: SlashCommandBuilder;
  cooldown?: number;
  execute: (client: Client, interaction: ChatInputCommandInteraction) => void;
};
