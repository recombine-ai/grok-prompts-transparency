import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import nunjucks from "nunjucks";
import createMessages from "./request";

dotenv.config({ path: '../.env' });

const args = process.argv.slice(2);
const modeIndex = args.indexOf('--mode');
const mode = modeIndex !== -1 && args.length > modeIndex + 1 ? args[modeIndex + 1] : 'normal';

console.log("Mode:", mode);
console.log("XAI_API_KEY", process.env.XAI_API_KEY);

const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
});

const systemPromptRaw = fs.readFileSync("prompt.j2", "utf8");
const injection = fs.readFileSync("injection.txt", "utf8");

const timeValue = "2025-05-18T12:00:00Z";
const timeWithInjection = mode === 'malicious' ? timeValue + " " + injection : timeValue;

const systemPromptRendered = nunjucks.renderString(systemPromptRaw, {
    "disable_search": true,
    "enable_memory": false,
    "has_memory_management": false,
    "is_mobile": false,
    "is_vlm": false,
    "dynamic_prompt": false,
    "custom_personality": null,
    "custom_instructions": null,
    "time": timeWithInjection,
    "grok3mini": false
});

const messages = createMessages({
    mode: mode,
});

const completion = await client.chat.completions.create({
    model: "grok-3-beta",
    messages,
});

console.log(completion.choices[0].message.content);

