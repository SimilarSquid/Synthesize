import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { Bot } from './utils/Bot';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    // GatewayIntentBits.GuildEmojisAndStickers,
  ],
});

export const bot = new Bot(client, process.env.TOKEN!);
