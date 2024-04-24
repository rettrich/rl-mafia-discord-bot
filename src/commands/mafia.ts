import {
  CacheType,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";

const shuffle = <T>(array: T[]) => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
};

const assignTeams = <T>(array: T[]) => {
  return array.reduce(
    (
      prev: { red: T[]; blue: T[] },
      current: T,
      index: number
    ): { red: T[]; blue: T[] } => {
      if (index % 2 == 0) {
        prev.red.push(current);
      }
      return prev;
    },
    { red: [], blue: [] }
  );
};

export default {
  data: new SlashCommandBuilder()
    .setName("mafia")
    .setDescription("Starts a new game with all people in the voice chat."),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    // Check if the user is in a voice channel
    const member = interaction.member as GuildMember;
    if (!member || !member.voice.channel) {
      return interaction.reply(
        "You need to be in a voice channel to use this command."
      );
    }
    // Fetch all members in the same voice channel
    const voiceChannel = member.voice.channel;
    const membersInVoiceChannel = voiceChannel.members.map((x) => x);
    const numPlayers = membersInVoiceChannel.length;

    shuffle(membersInVoiceChannel);
    const mafiaIndex = Math.floor(Math.random() * numPlayers);

    let errorFlag = false;
    // Send a direct message to each member
    membersInVoiceChannel.forEach(async (member: GuildMember, index) => {
      try {
        // Check if the member is a bot, if so, skip
        if (member.user.bot) return;

        // Send a direct message to the member
        if (index === mafiaIndex) {
          await member.send("You're Mafia");
        } else {
          await member.send("You're a villager");
        }
      } catch (error) {
        errorFlag = true;
        console.error(`Failed to send DM to ${member.user.tag}: ${error}`);
      }
    });

    if (errorFlag) {
      await interaction.reply("An error occurred.");
      return;
    }

    const { red, blue } = assignTeams(membersInVoiceChannel);
    const redPlayersString = red.map((member) => member.displayName).join(", ");
    const bluePlayersString = blue.map((member) => member.displayName).join(", ");

    await interaction.reply("DMs have been sent to the players")
    await interaction.reply(`Team red: ${redPlayersString}\n`);
    await interaction.reply(`Team blue: ${bluePlayersString}\n`);
  },
};
