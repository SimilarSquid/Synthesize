import { Client, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { Affix } from './classes/Affix';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);
const affix = new Affix('RegisterSlashCommands');

const commandNamesToRegister: string[] = [];
const commandNamesToUpdate: string[] = [];

export async function registerSlashCommands(
  commands: SlashCommandBuilder[],
  client: Client,
  statusLog = false
) {
  affix.logFormatted('loading', 'Registering slash commands...');

  const guild = await client.guilds.fetch(process.env.GUILD_ID!);
  const guildCommands = await guild.commands.fetch();
  const unmatchedCommandNames = new Set(guildCommands.map((c) => c.name));

  for (const command of commands) {
    if (unmatchedCommandNames.has(command.name)) {
      // Command already exists, check for updates
      const existingCommand = guildCommands.find(
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
              `Slash command \x1b[97m${command.name}\x1b[0m description \x1b[34mupdated\x1b[0m.`
            );
        } else {
          // Command exists with the same properties
          if (statusLog)
            affix.logFormatted(
              'info',
              `Slash command \x1b[97m${command.name}\x1b[0m already \x1b[33mexists\x1b[0m.`
            );
        }
      }
    } else {
      // Command is new, needs to be registered
      commandNamesToRegister.push(command.name);
      if (statusLog)
        affix.logFormatted(
          'info',
          `Slash command \x1b[97m${command.name}\x1b[0m has been \x1b[32madded\x1b[0m.`
        );
    }
  }

  if (unmatchedCommandNames.size) {
    for (const unmatchedCommandName of unmatchedCommandNames) {
      if (statusLog)
        affix.logFormatted(
          'info',
          `Slash command \x1b[97m${unmatchedCommandName}\x1b[0m \x1b[31mdeleted\x1b[0m.`
        );
    }

    affix.logFormatted(
      'info',
      `Detected \x1b[31m${unmatchedCommandNames.size} deleted\x1b[0m slash command(s).`
    );
  }

  if (commandNamesToUpdate.length) {
    affix.logFormatted(
      'info',
      `Detected \x1b[34m${commandNamesToUpdate.length} updated\x1b[0m slash command(s).`
    );
  }

  if (commandNamesToRegister.length) {
    affix.logFormatted(
      'info',
      `Detected \x1b[32m${commandNamesToRegister.length} added\x1b[0m slash command(s).`
    );
  }

  if (
    commandNamesToUpdate.length ||
    commandNamesToRegister.length ||
    unmatchedCommandNames.size
  ) {
    try {
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID!,
          process.env.GUILD_ID!
        ),
        { body: commands }
      );
      affix.logFormatted(
        'success',
        'Slash commands were registered successfully!'
      );
    } catch (error) {
      console.error(
        affix.getFormatted(
          'error',
          `There was an error while updating the slash commands: ${error}`
        )
      );
    }
  } else {
    affix.logFormatted(
      'success',
      'No new commands to register. All commands are up to date.'
    );
  }
}
