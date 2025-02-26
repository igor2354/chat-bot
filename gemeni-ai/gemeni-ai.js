const fs = require("fs");
const Crypto = require('crypto');
const path = require('path')
const { GoogleGenerativeAI } = require("@google/generative-ai");
const chatHistoryDefault = require('../model/history.json');

class GemeniAi {
    constructor() {
        this.genAI; 
        this.model;
        this.chatHistory = chatHistoryDefault;
        this.fileChatPath = '../model/history.json';
    }

    createNewChat() {
        this.fileChatPath = `../model/history.${Crypto.randomBytes(6).readUIntLE(0,6).toString(36)}.${'json'}`;

        const newChat = fs.openSync(path.join(__dirname, this.fileChatPath), 'wx');

        fs.writeFile(
            newChat,
            JSON.stringify([]),
            err => {
                if (err) {
                    console.log("Ошибка при записи в файл", err);
                } else {
                    console.log("Файл запсан");
                }
            }
        );
        
        this.chatHistory = [];

        this.chat = this.model.startChat({
            history: this.chatHistory,
        });

        return this.fileChatPath;
    }

    setChatHistory(file) {
      fs.writeFile(
        file,
        JSON.stringify(this.chatHistory),
        err => {
            if (err) {
                console.log("Ошибка при записи в файл", err);
            } else {
                console.log("Файл запсан");
            }
        }
      );
    }

    checkOutChat(pathChat) {
        this.fileChatPath = pathChat;
        
        fs.readFile(path.join(__dirname, pathChat), 'utf8', (error, data) => {
            if (error) {
              console.error('Произошла ошибка при чтении файла:', error);
              return;
            }

            this.chatHistory = JSON.parse(data);

            this.chat = this.model.startChat({
                history: this.chatHistory,
            });
        });
    }

    async run(prompt) {
        const result = await this.chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();
        
        this.setChatHistory(path.join(__dirname, this.fileChatPath));

        return { response: text };
    }

    init(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        this.chat = this.model.startChat({
            history: this.chatHistory,
        });
    }
};

module.exports = GemeniAi