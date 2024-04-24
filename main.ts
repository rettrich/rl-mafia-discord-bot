import { Client, Events, GatewayIntentBits } from "discord.js"
import config from "./config.json" with { type: "json" }

console.log(config)
console.log("hi")

const client = new Client(
    { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates]}
)

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.login(config.token)