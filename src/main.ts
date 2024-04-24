import { Collection, Client, Events, GatewayIntentBits, ClientOptions, SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from "discord.js"
import mafiaCommand from "./commands/mafia.js";
import config from "./config.json" with { type: "json" }

export default class MafiaBotClient extends Client {
  commands: Collection<string, { data: SlashCommandBuilder; execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<any>}>
  constructor(options: ClientOptions) {
   super(options)
   this.commands = new Collection();
   this.commands.set(mafiaCommand.data.name, mafiaCommand);
  }
}

const client = new MafiaBotClient(
    { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates]}
)

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    interaction.reply(`Unknown command ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch(error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
  }
})

client.login(config.token)
