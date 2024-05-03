import {
  EmbedBuilder,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  TextChannel,
  User,
} from 'discord.js';
import { bot } from '../..';
import { emojiToUnicode } from '../../utils/emojiToUnicode';
import { is404 } from '../../utils/is404';

export default async (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) => {
  const logChannelId = '1235185706532339782';
  const logChannel = bot.client.channels.cache.get(logChannelId) as TextChannel;

  const params = {
    reaction: reaction,
    user: user,
  };

  for (const [key, value] of Object.entries(params)) {
    if (value.partial) {
      try {
        await value.fetch();
      } catch (error) {
        console.error(`Failed to fetch complete ${key} from partial: ${error}`);
        return;
      }
    }
  }

  if (!reaction.emoji.name || !user.username) return;

  const emojiUnicode = !reaction.emoji.id
    ? emojiToUnicode(reaction.emoji.name)
    : null;

  let twemojiImage = emojiUnicode
    ? `https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/${emojiUnicode}.png`
    : null;

  if (emojiUnicode && twemojiImage) {
    if (await is404(twemojiImage)) {
      // Emoji not found in Twemoji, trying Unicode without "fe0f"
      twemojiImage = `https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/${emojiUnicode
        .split('-')
        .filter((char) => char !== 'fe0f')
        .join('-')}.png`;
    }
  }

  const emojiURL = reaction.emoji.imageURL() || twemojiImage;

  const emojiName = reaction.emoji.id
    ? `<:${reaction.emoji.name}:${reaction.emoji.id}>`
    : reaction.emoji.name;

  const embed = new EmbedBuilder()
    .setColor('Red')
    .setAuthor({
      name: user.username || user.id,
      iconURL: user.displayAvatarURL(),
      url: user.displayAvatarURL(),
    })
    .setThumbnail(emojiURL)
    .addFields(
      {
        name: 'Removed emoji in:',
        value: reaction.message.channel.url || 'Unknown channel',
        inline: false,
      },
      {
        name: 'From message:',
        value:
          `${reaction.message.content} ${reaction.message.url}` ||
          'Unknown message',
        inline: false,
      },
      {
        name: 'Emoji name:',
        value: emojiName || 'Unknown name',
        inline: true,
      }
    )
    .addFields(
      emojiUnicode
        ? {
            name: 'Emoji Unicode:',
            value: emojiUnicode || 'Unknown Unicode',
            inline: true,
          }
        : {
            name: 'Emoji ID:',
            value: reaction.emoji.id || 'Unknown ID',
            inline: true,
          }
    )
    .setTimestamp()
    .setFooter({
      text: `User ID: ${user.id}`,
    });

  logChannel.send({ embeds: [embed] });
};
