import 'dotenv/config';
import {
  ActivityType,
  Client,
  Events,
  Interaction,
  SlashCommandBuilder,
  Snowflake,
  TextChannel,
} from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from '../types/Command';
import { Activity } from './classes/Activity';
import { registerSlashCommands } from './registerSlashCommands';
import logRemovedReactions from '../events/messageReactionRemove/logRemovedReactions';

let status = [
  {
    name: 'with Infex',
    type: ActivityType.Playing,
  },
  {
    name: "Infex's bongo",
    type: ActivityType.Listening,
  },
];

export class Bot {
  public slashCommands = new Array<SlashCommandBuilder>();
  public slashCommandsMap = new Map<string, Command>();
  public globalSlashCommands = new Array<SlashCommandBuilder>();
  public globalSlashCommandsMap = new Map<string, Command>();
  public cooldowns = new Map<string, Map<Snowflake, number>>();

  constructor(private _client: Client, private _token: string) {
    this.start();
  }

  get client() {
    return this._client;
  }

  private start() {
    this._client.login(this._token);

    this._client.on(Events.ClientReady, () => {
      console.log(
        `\x1b[31m♥\x1b[0m ${this._client.user?.username} is online. \x1b[40m●ྌ●\x1b[0m`
      );

      new Activity(this._client, status, 120).startCycle();

      this.registerSlashCommands();
      this.fetchChannels();
      this.onMessageReactionRemove();
      this.onRateLimit();
    });
    this.onInteractionCreate();
  }

  private async registerSlashCommands() {
    const commandDirs = {
      guild: 'commands/guild',
      global: 'commands/global',
    } as const;

    for (const [type, path] of Object.entries(commandDirs)) {
      const commandFiles: Command[] = readdirSync(join(__dirname, '..', path))
        .filter((file) => /\.(js|ts)$/.test(file))
        .map((file) => require(`../${path}/${file}`).default);

      for (const command of commandFiles) {
        if (type === 'guild') {
          this.slashCommands.push(command.data);
          this.slashCommandsMap.set(command.data.name, command);
        } else {
          this.globalSlashCommands.push(command.data);
          this.globalSlashCommandsMap.set(command.data.name, command);
        }
      }

      await registerSlashCommands(
        type === 'guild' ? this.slashCommands : this.globalSlashCommands,
        this._client,
        type as 'guild' | 'global'
      );
    }
  }

  private async onInteractionCreate() {
    this._client.on(
      Events.InteractionCreate,
      async (interaction: Interaction): Promise<void> => {
        try {
          if (!interaction.isChatInputCommand()) return;

          const cmdName = interaction.commandName;

          const cmd =
            this.slashCommandsMap.get(interaction.commandName) ||
            this.globalSlashCommandsMap.get(interaction.commandName);

          if (!cmd) return;

          // Cooldowns
          if (!this.cooldowns.has(cmdName)) {
            this.cooldowns.set(cmdName, new Map());
          }

          const now = Date.now();
          const timestamps = this.cooldowns.get(cmdName)!;
          const cooldownAmount = (cmd.cooldown || 1) * 1000;

          const timestamp = timestamps.get(interaction.user.id);

          if (timestamp) {
            const expirationTime = timestamp + cooldownAmount;

            if (now < expirationTime) {
              const timeLeft = (expirationTime - now) / 1000;
              await interaction.reply({
                content: `Please wait ${timeLeft.toFixed(1)} more second${
                  timeLeft === 1 ? '' : 's'
                } before reusing the \`/${cmdName}\` command.`,
                ephemeral: true,
              });
              return;
            }
          }

          timestamps.set(interaction.user.id, now);
          setTimeout(
            () => timestamps.delete(interaction.user.id),
            cooldownAmount
          );

          cmd.execute(this._client, interaction);
        } catch (error) {
          console.error(error);
          if (interaction.isChatInputCommand())
            await interaction.reply({
              content: 'There was an error while executing this command!',
              ephemeral: true,
            });
        }
      }
    );
  }

  private async onMessageReactionRemove() {
    this._client.on(Events.MessageReactionRemove, async (reaction, user) => {
      logRemovedReactions(reaction, user);
    });
  }

  private async fetchChannels() {
    const channels = ['1232057674389262450', '1235184614063079536'];

    for (const channel of channels) {
      const channelCache = this._client.channels.cache.get(channel);
      if (!channelCache) return console.error(`Channel ${channel} not found!`);

      const textChannel = channelCache as TextChannel;
      await textChannel.messages.fetch();
    }
  }

  private onRateLimit() {
    this._client.on('rateLimit', (rateLimitInfo) => {
      console.log(`Rate limited: ${rateLimitInfo}`);
    });
  }

  // public addEvent(event: string, callback: Function) {
  //   this._client.on(event, callback);
  // }
}
