import { Client, GatewayIntentBits } from 'discord.js';
require('dotenv').config();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

const token = process.env.BOT_TOKEN;
const voiceChannelId = process.env.VOICE_CHANNEL_ID;

if (voiceChannelId === undefined) {
    console.error("VOICE_CHANNEL_ID is not set.");
    process.exit(1); // Exit the program or handle this scenario as needed
}



client.on('ready', async () => {
    // Check if client is null
    if (!client.user) return;
    console.log(`Logged in as ${client.user.tag}!`);

    // Attempt to fetch the channel and check if it's null or not voice-based
    const channel = await client.channels.fetch(voiceChannelId).catch(console.error);
    if (!channel || !channel.isVoiceBased()) return; // Ensure the channel is a voice channel

    const members = channel.members.size;
    if (members > 1 || members === 0) {
        // Set to "no one is alone" if more than one member is present or no member is present
        await channel.setName('no one is alone');
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Check if the newState or the member is null
    if (!newState.member || (!oldState.channelId && !newState.channelId)) {
        return;
    }

    // Check if the update is relevant to our channel
    if (oldState.channelId !== voiceChannelId && newState.channelId !== voiceChannelId) {
        return;
    }

    // Attempt to fetch the channel and check if it's null or not voice-based
    const channel = await client.channels.fetch(voiceChannelId).catch(console.error);
    if (!channel || !channel.isVoiceBased()) return; // Ensure the channel is a voice channel

    const members = channel.members.size;
    let newName = '';

    if (members === 0) {
        newName = 'no one is alone';
    } else if (members === 1) {
        // Ensure member and displayName are not null
        const memberName = newState.member ? newState.member.displayName : 'someone';
        newName = `${memberName} is alone`;
    } else {
        // At this point, newState.member is guaranteed to be not null
        newName = `${newState.member.displayName} is not alone`;
    }

    // Rename the channel if the name has changed and is not null
    if (channel.name !== newName) {
        await channel.setName(newName).catch(console.error);
    }
});

process.on('SIGINT', async () => {
    console.log('Bot is shutting down...');

    // Attempt to fetch the channel and check if it's null or not voice-based
    const channel = await client.channels.fetch(voiceChannelId);
    if (!channel || !channel.isVoiceBased()) return; // Ensure the channel is a voice channel
    
    if (channel.isVoiceBased() && channel.name !== 'lemon is alone') {
        await channel.setName('lemon is alone');
        console.log('Channel name set to "lemon is alone"');
    }

    // Gracefully close your client connection
    client.destroy();
    
    // Ensure the process exits after a delay to allow for cleanup
    setTimeout(() => process.exit(), 1000);
});



// Login to Discord with your app's token
client.login(token);
