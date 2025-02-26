"use strict";

const { Bot } = require("grammy");
const { Menu } = require("@grammyjs/menu");

class TgBot {
    constructor() {
        this.bot;
        this.menu;
    }

    createComand(comand, callback) {
        this.bot.command(comand, callback);
    }

    createWatch(watchName, callback) {
        this.bot.on(watchName, callback);
    }

    createButton(textBtn, textSuccsess, funcCreateChat) {
        this.menu.text(textBtn, async (ctx) => {
            try {
                funcCreateChat()
                await ctx.reply(textSuccsess);
            } catch (error) {
                console.log(error);
                await ctx.reply("Ошибка");
            }
        }).row();
    }

    init(apiKey) {
        this.bot = new Bot(apiKey);

        this.menu = new Menu("menu-ai-chat");

        this.bot.use(this.menu);

        this.bot.start({
            onStart: botInfo => {
                console.log(`Бот запущен ${botInfo.username}`)
            },
            allowed_updates: ["chat_member", "message", "callback_query"],
        });
    }
};

module.exports = TgBot