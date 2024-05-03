export const emojiToUnicode = (emoji: string) => {
  return [...emoji].map((char) => char.codePointAt(0)!.toString(16)).join('-');
};
