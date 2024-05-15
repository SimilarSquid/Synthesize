import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { Affix } from './classes/Affix';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

const commandNamesToRegister: string[] = [];
const commandNamesToUpdate: string[] = [];

export async function registerSlashCommands(
  commands: SlashCommandBuilder[],
  client: Client,
  type: 'guild' | 'global' = 'guild',
  statusLog = false
) {
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);

  const affix = new Affix(
    type === 'guild'
      ? 'RegisterGuildSlashCommands'
      : 'RegisterGlobalSlashCommands'
  );

  affix.logFormatted('loading', `Registering ${type} slash commands...`);

  let guild;
  let fetchedCommands;

  if (type === 'guild') {
    // guild = client.guilds.cache.get(process.env.GUILD_ID!);
    guild = await client.guilds.fetch(process.env.GUILD_ID!);
    if (!guild)
      return console.error(
        affix.getFormatted(
          'error',
          `Guild with ID ${process.env.GUILD_ID} not found.`
        )
      );
    fetchedCommands = await guild.commands.fetch();
  } else {
    if (!client.application)
      return console.error(
        affix.getFormatted(
          'error',
          'Client application is null. Please check if the bot is connected to the gateway.'
        )
      );
    fetchedCommands = await client.application.commands.fetch();
  }

  const unmatchedCommandNames = new Set(fetchedCommands.map((c) => c.name));

  for (const command of commands) {
    if (unmatchedCommandNames.has(command.name)) {
      // Command already exists, check for updates
      const existingCommand = fetchedCommands.find(
        (c) => c.name === command.name
      );

      if (existingCommand) {
        unmatchedCommandNames.delete(command.name);

        const newDescription =
          command.description !== existingCommand.description;

        if (newDescription) {
          // Command exists but description is different
          commandNamesToUpdate.push(command.name);
          if (statusLog)
            affix.logFormatted(
              'info',
              `${typeCapitalized} slash command \x1b[97m${command.name}\x1b[0m description \x1b[34mupdated\x1b[0m.`
            );
        } else {
          // Command exists with the same properties
          if (statusLog)
            affix.logFormatted(
              'info',
              `${typeCapitalized} slash command \x1b[97m${command.name}\x1b[0m already \x1b[33mexists\x1b[0m.`
            );
        }
      }
    } else {
      // Command is new, needs to be registered
      commandNamesToRegister.push(command.name);
      if (statusLog)
        affix.logFormatted(
          'info',
          `${typeCapitalized} slash command \x1b[97m${command.name}\x1b[0m has been \x1b[32madded\x1b[0m.`
        );
    }
  }

  if (unmatchedCommandNames.size) {
    for (const unmatchedCommandName of unmatchedCommandNames) {
      if (statusLog)
        affix.logFormatted(
          'info',
          `${typeCapitalized} slash command \x1b[97m${unmatchedCommandName}\x1b[0m \x1b[31mdeleted\x1b[0m.`
        );
    }

    affix.logFormatted(
      'info',
      `Detected \x1b[31m${unmatchedCommandNames.size} deleted\x1b[0m ${type} slash command(s).`
    );
  }

  if (commandNamesToUpdate.length) {
    affix.logFormatted(
      'info',
      `Detected \x1b[34m${commandNamesToUpdate.length} updated\x1b[0m ${type} slash command(s).`
    );
  }

  if (commandNamesToRegister.length) {
    affix.logFormatted(
      'info',
      `Detected \x1b[32m${commandNamesToRegister.length} added\x1b[0m ${type} slash command(s).`
    );
  }

  if (
    commandNamesToUpdate.length ||
    commandNamesToRegister.length ||
    unmatchedCommandNames.size
  ) {
    try {
      if (type === 'guild') {
        await rest.put(
          Routes.applicationGuildCommands(
            process.env.CLIENT_ID!,
            process.env.GUILD_ID!
          ),
          {
            body: commands,
          }
        );
      } else {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
          body: commands,
        });
      }
      affix.logFormatted(
        'success',
        `${typeCapitalized} slash commands were registered successfully!`
      );
    } catch (error) {
      console.error(
        affix.getFormatted(
          'error',
          `There was an error while updating the ${type} slash commands: ${error}`
        )
      );
    }
  } else {
    affix.logFormatted(
      'success',
      `No new ${type} commands to register. All commands are up to date.`
    );
  }
}
