const dotenv = require('dotenv').config();
const path = require('path')
const glob = require('glob')
const TgBot = require("./tg-bot/tg-bot.js");
const GemeniAi = require("./gemeni-ai/gemeni-ai.js");

// Создаем экземпляр тг бота
const bot = new TgBot();
bot.init(process.env.TG_BOT_API_KEY);

// Создаем экземпляр ai чата
const gemeniAi = new GemeniAi();
gemeniAi.init(process.env.GEMENI_API_KEY);

bot.createComand("start", async (ctx) => {
  await ctx.reply("Меню:", { reply_markup: bot.menu });
});

bot.createButton('Создать новый чат', 'Новый чат создан', () => {
  const filePath = gemeniAi.createNewChat();
  let extension = path.extname(filePath)
  let fileName = path.basename(filePath, extension)

  bot.createButton(`Переключиться на чат ${fileName}`, `Активный чат ${fileName}`, () => gemeniAi.checkOutChat(filePath));
})

const listChats = glob.sync('./model/*.json').map((url) => './' + url.replaceAll(/\\/g, '/'));

listChats.forEach(element => {
  let extension = path.extname(element)
  let fileName = path.basename(element, extension)

  bot.createButton(`Переключиться на чат ${fileName}`, `Активный чат ${fileName}`, () => gemeniAi.checkOutChat("." + element))
});

bot.createWatch("message", async (ctx) => {
    try {
      if (!gemeniAi.chat) return;

      if (ctx.update.message.text && ctx.update.message.text.toLowerCase().startsWith("+")) {
        const result = await gemeniAi.run(ctx.update.message.text.replace("+", ''));
  
          if (Number(result.response.length) >= 4090) {
            let arrMessage = result.response.match(new RegExp('[\\s\\S]{1,' + +4000 + '}', 'g'));

            await arrMessage.reduce(async (promis, message) => {
              await promis;
              await ctx.reply(message);
              await new Promise(resolve => setTimeout(resolve, 100))
            }, Promise.resolve())
          } else {
            ctx.reply(result.response)
          }
      }
    } catch (error) {
      ctx.reply(error)
    }
})