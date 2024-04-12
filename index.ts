const BOT_TOKEN: string = process.env["BOT_TOKEN"] || "";
const BOT_COOLDOWN: number = process.env["BOT_COOLDOWN"] == undefined ? 5 : parseInt(process.env["BOT_COOLDOWN"] || "");

if (BOT_TOKEN.trim() == "") {
    console.log("Missing bot token. Please set the environment variable BOT_TOKEN to your bot's token.");
    process.exit(1);
}

if (isNaN(BOT_COOLDOWN) || BOT_COOLDOWN < 0) {
    console.log("Bot cooldown value is invalid. Please set to a positive number representing the cooldown period in minutes.");
}

const COOLDOWN_MS: number = BOT_COOLDOWN * 60 * 1000;

