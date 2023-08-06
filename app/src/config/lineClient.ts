// lineClient.ts
import { Client, ClientConfig } from "@line/bot-sdk";

export const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET || '',
};

export const client = new Client(clientConfig);
