// textEventHandler.ts
import { WebhookEvent, TextMessage, MessageAPIResponseBase } from "@line/bot-sdk";
import { client } from "../config/lineClient";
import { askCustomer, askDementia } from "../module/askGpt";

export class EventHandler {
  private customerState: string[] = [];

  public async handleTextEvent(event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> {
    if (event.type !== 'message' || event.message.type !== 'text') {
      return;
    }
    const { replyToken } = event;
    const { text } = event.message;
    const { userId } = event.source;

    let responseMessage: string;
    if (text.includes('さまが来店されました')) {
      // broadcast
      const customerName = text.replace('さまが来店されました', '')
      this.customerState.push(customerName)
      responseMessage = text
      const response: TextMessage = {
        type: 'text',
        text: text
      };
      client.broadcast(response);
      const attention = await askCustomer(customerName);
      const nextResponse: TextMessage = {
        type: 'text',
        text: attention
      };
      return client.broadcast(nextResponse);
    } else if (text.includes('さまが無事退店されました')) {
      const customerName = text.replace('さまが無事退店されました', '')
      this.customerState = this.customerState.filter(elem => elem != customerName)
      responseMessage = text
      const response: TextMessage = {
        type: 'text',
        text: text
      };
      return await client.broadcast(response);
    } else if (text.includes('さまが未払いで退店されました')) {
      const customerName = text.replace('さまが未払いで退店されました', '')
      this.customerState = this.customerState.filter(elem => elem != customerName)
      responseMessage = `${customerName}さまが未払いで退店されました。\n悪意ある窃盗ではありませんので優しい対応をお願いします。`
      const response: TextMessage = {
        type: 'text',
        text: responseMessage
      };
      return await client.broadcast(response);
    } else if (text === '店内') {
      if (this.customerState.length === 0) {
        responseMessage = 'まだ来店されておりません'
      } else {
        let message = '店内には';
        for (let i = 0; i < this.customerState.length; i++) {
            message += this.customerState[i] + 'さま';
            if (i !== this.customerState.length - 1) {
                message += '、';
            }
        }
        message += '、計' + this.customerState.length + '名のお客さまがいらっしゃいます。';
        const firstResponse: TextMessage = {
          type: 'text',
          text: message
        };
        client.pushMessage(userId, firstResponse)
        for (const eachCustomer of this.customerState) {
          const attention = await askCustomer(eachCustomer);
          const response: TextMessage = {
            type: 'text',
            text: attention
          };
          client.pushMessage(userId, response)
        }
        responseMessage = '以上のお客さまがいらっしゃいます'
      }
    } else if (text === '認知症について') {
      const res = await askDementia();
      responseMessage = res;
    } else {
      responseMessage = text  
    }
    
    const response: TextMessage = {
      type: 'text',
      text: responseMessage
    };
    return await client.replyMessage(replyToken, response);
  }
}
