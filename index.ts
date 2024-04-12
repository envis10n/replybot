import { Client, Events, GatewayIntentBits, Message, MessagePayload, type MessagePayloadOption, type MessageTarget } from "discord.js";
import { readFile } from "fs/promises";
import * as path from "path";

// Setup bot settings.
const BOT_TOKEN: string = process.env["BOT_TOKEN"] || "";
const BOT_COOLDOWN: number = process.env["BOT_COOLDOWN"] == undefined ? 5 : parseInt(process.env["BOT_COOLDOWN"] || "");
const BOT_REGEX: RegExp = new RegExp(process.env["BOT_REGEX"] || "", "gi");
const BOT_REPLY_TEXT: string = process.env["BOT_REPLY_TEXT"] || "";
const BOT_REPLY_IMAGE: string | undefined = process.env["BOT_REPLY_IMAGE"] == undefined ? undefined : path.isAbsolute(process.env["BOT_REPLY_IMAGE"]) ? process.env["BOT_REPLY_IMAGE"] : path.resolve(process.cwd(), process.env["BOT_REPLY_IMAGE"]);

/**
 * Build our bot's message payload.
 * @param target The message being replied to.
 * @returns MessagePayload
 */
async function buildMessage(target: Message): Promise<MessagePayload> {
    const opts: MessagePayloadOption = {
        content: BOT_REPLY_TEXT,
        reply: {
            messageReference: target,
        }
    }
    if (BOT_REPLY_IMAGE != undefined) {
        const buf: Buffer = await readFile(BOT_REPLY_IMAGE);
        opts.files = [buf];
    }
    return MessagePayload.create(target, opts);
}

// Handle missing or invalid settings
if (BOT_TOKEN.trim() == "") {
    console.log("Missing bot token. Please set the environment variable BOT_TOKEN to your bot's token.");
    process.exit(1);
}

if (isNaN(BOT_COOLDOWN) || BOT_COOLDOWN < 0) {
    console.log("Bot cooldown value is invalid. Please set to a positive number representing the cooldown period in minutes.");
    process.exit(1);
}

// Actual cooldown time in milliseconds.
const COOLDOWN_MS: number = BOT_COOLDOWN * 60 * 1000;
// Track the last cooldown time. If current time is past this time, the cooldown has completed.
let last_cooldown: number = Date.now();

// The actual client instance.
const CLIENT: Client = new Client({ intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Handle the ClientReady event and log that we are indeed logged in.
CLIENT.once(Events.ClientReady, client => {
    console.log(`Client ready. Logged in as: ${client.user.tag}. Cooldown: ${BOT_COOLDOWN} minute(s).`);
});

// Message handler.
CLIENT.on(Events.MessageCreate, async message => {
    // Ignore bot authors.
    if (message.author.bot) return;
    // Trim the message content to ignore extra whitespace.
    const msg: string = message.content.trim();
    // Get a timestamp for NOW.
    const ts: number = Date.now();
    // If the timestamp is past our cooldown marker and the message matches the expression, proceed.
    if (msg.length > 0 && BOT_REGEX.test(msg) && ts >= last_cooldown) {
        // Set the new cooldown time.
        last_cooldown = ts + COOLDOWN_MS;
        // Reply with our payload.
        message.reply(await buildMessage(message));
    }
});

// Login the client.
CLIENT.login(BOT_TOKEN);