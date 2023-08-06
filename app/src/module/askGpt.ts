import { Configuration, OpenAIApi } from "openai";
import { custmerData } from "../utils/customerData";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const askDementia = async (): Promise<string> => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        "role": "system",
        "content": "あなたは認知症の専門医です。小売店に特定の特徴を持つ認知症の患者さんが来店された場合について尋ねられますので、適切な回答をしてください"
      },
      {
        role: "user",
        content: "認知症の方が自分の経営する小売店に来店された場合、どのように対応することが適切でしょうか"
      }
    ],
  });
  return (completion.data.choices[0].message.content);
}

export const askCustomer = async (customerName: string):Promise<string> => {
  const askForCustomer = custmerData.filter(obj => obj.name === customerName);
  if (askForCustomer.length === 0){
    console.log('そのようなお客さまはいらっしゃいません。');
  } else {
    const customerUtil = JSON.stringify(askForCustomer[0]);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          "role": "system",
          "content": `あなたは認知症の専門医です。小売店に特定の特徴を持つ認知症の患者さんが実際に来店されました。
          nameがお名前、walletがお支払いをするためのお金を持っている場所、attentionがお客さまの注意事項となりますので、
          その方の特徴を確認した上で、対応として適切な回答をしてください
          接客する際の注意事項、現場ですぐに実践できることや心構えを中心に回答してください`
        },
        {
          role: "user",
          content: `次のような認知症の方が店舗に来店されました。どのように対処することが適切かを教えてください。
          ## お客さまの詳細 ##
          ${customerUtil}`
        }
      ],
    });
    return (completion.data.choices[0].message.content);
  }
}