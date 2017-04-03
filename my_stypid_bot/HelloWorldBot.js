var TelegramBot = require('node-telegram-bot-api');

var FileSystem = require('fs');
var Http = require('http');
var Request = require('request');



var token = getTokenAccess();

console.log("Token %s", token)
var catchPhrases = getCatchPhrases();
var httpOptions = [
    {
        host: 'www.cbr.ru',
        port: 80,
        path: '/scripts/XML_daily.asp?'
    },
    {
        host: 'www.bank-ua.com',
        port: 80,
        path: '/export/currrate.xml'
    },
    {
        host: 'nbrb.by',
        port: 80,
        path: '/Services/XmlExRates.aspx'
    }
];

var globalCountOfMessagesWithDigest = 0;
var globalUserNameIs = "pigunther";
var globalBotUserName;
var globalMessageIdForReply;

var globalStackListDigestMessages = [ ];

var globalCofeeSticker = 'https://api.z-lab.me/stickers/cofe.webp';
var gameStatURL = 'https://api.z-lab.me/img/lgsl/servers_stats.png';

var globalJsonStackName = 'DigestBotStackLog.json';

var botOptions = {
    polling: true
};
//var bot = new TelegramBot(token, botOptions);

var date = new Date();
var current_hour = date.getHours();
var current_minutes = date.getMinutes();
var current_seconds = date.getSeconds();

bot.getMe().then(function(me) {
    console.log('Hello! My name is %s!', me.first_name);
    console.log('My id is %s.', me.id);
    console.log('And my username is @%s.', me.username);
});

bot.on('text', function(msg)
{
    var messageChatId = msg.chat.id;
    console.log("messageChaiId: %s", messageChatId);
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUsr = msg.from.username;

    if (messageText === '/say') {
        sendMessageByBot(messageChatId, 'Hello World!');
    }

    if (messageText === '/time') {
        var time = (messageDate - 1483200000); //Date - 31.12.2016 19:00;
        time = (time - time % 60)/60;
        var time_in_simple_format = String(19+(time-time%60)/60) + " : " + String(time%60);
        sendMessageByBot(messageChatId, time_in_simple_format);
        console.log("__", messageDate, "__");

    }

    if (messageText.indexOf('/sayOnTime') === 0 || messageText.indexOf('/sayOnTime@'+globalBotUserName) === 0) {
        console.log("123123123123123______");
        if (getAdminRights()) {
            messageText = messageText.trim();
            var splitCommandList = messageText.split(' ');
            console.log(splitCommandList);
            if (splitCommandList.length === 3 && splitCommandList[1] === '1' && /\d{1,2}:\d{2}/.test(splitCommandList[2])) {

                var hours = Number(splitCommandList[2][0]+splitCommandList[2][1]);
                var minutes = Number(splitCommandList[2][3]+splitCommandList[2][4]);
                console.log("in function");
                var time = minutes+hours*60;
                console.log(hours, minutes);
                date = new Date();
                while (date.getHours()*60+date.getMinutes() - time < 0) {
                    date = new Date();
                    console.log("here ", date.getSeconds(), date.getHours()*60+date.getMinutes() - time);
                }
                sendMessageByBot(messageChatId, "TIMER !!!!!!!!!");
            }
            if (splitCommandList.length === 4 && splitCommandList[1] === '2' && /\d{1,2}:\d{2}/.test(splitCommandList[2])) {
                var chatId = splitCommandList[3];
                var hours = Number(splitCommandList[2][0]+splitCommandList[2][1]);
                var minutes = Number(splitCommandList[2][3]+splitCommandList[2][4]);
                console.log("in function");
                var time = minutes+hours*60;
                console.log(hours, minutes);
                date = new Date();
                while (date.getHours()*60+date.getMinutes() - time < 0) {
                    date = new Date();
                }
                sendMessageByBot(chatId, catchPhrases.NY[0]);
            }
            // -------------------
            if (splitCommandList.length === 3 && splitCommandList[1] === 'NY') {
                var chatId = splitCommandList[2];
                date = new Date();
                console.log(date.getHours(), date.getMinutes(), date.getSeconds());
                while (date.getHours()*60+date.getMinutes() !== 0 && date.getHours() !== 0) {
                    date = new Date();
                }
                sendMessageByBot(chatId, catchPhrases.NY[0]);
            }



        } else {
            sendNoAccessMessage(messageChatId);
        }
    }

    //here will be digest
    if (messageText.indexOf('#digest') >= 0) {
    	if (messageText.length < 3000) {
            globalCountOfMessagesWithDigest++;
            var normalMessage = normalizeMessage(messageText);
            if (!(isBlank(normalMessage))) {
                var messageInfoStruct = {
                    's_chatID': messageChatId,
                    's_date': messageDate,
                    's_message': normalMessage,
                    's_username': globalUserNameIs
                };

                globalStackListDigestMessages.push(messageInfoStruct);

                // Send message by bot.
                sendMessageByBot(messageChatId,
                                 catchPhrases.digestTag[getRandomInt(0, catchPhrases.digestTag.length - 1)]);

                // Save Stack to File
                writeJSONFileToFileSystem(globalJsonStackName, messageChatId, false);
            }
        } else {
            sendMessageByBot(messageChatId,
                             catchPhrases.debugCommandMessages[5]);
		}
    }

    // DIGEST COMMAND
    if (messageText.indexOf('/digest') === 0 || messageText.indexOf('/digest@'+globalBotUserName) === 0) {
        var bGoodCommand = false;
        var messageDelay = 0;
        var fullCommand = '/digest@' + globalBotUserName;
        var msgLength = messageText.length;
        var fullCommandLength = fullCommand.length + 2;

        messageText = messageText.trim();

        if (messageText === '/digest' || messageText === fullCommand) {
            bGoodCommand = true;
            messageDelay = getMessageDelay(1);
        }

        if (msgLength === 9 || msgLength === fullCommandLength) {
            var arg = parseInt(messageText[msgLength - 1]);
            if (arg >= 1 && arg <= 7) {
                bGoodCommand = true;
                messageDelay = getMessageDelay(arg);
            }
        }

        if (bGoodCommand) {
            // Digest delay.
            // 45 sec for debug.
            // 43 200 for 12-hours.
            // 86 400 for 24-hours.
            // 172 800 for 48-hours.
            // 604 800 for a week.
            var mainDelay = 604800 + 43200;
            var dayDelay = messageDate - messageDelay;

            var bSendDigest = false;

            if (globalStackListDigestMessages.length > 0) {
                // Delete all obsolete digest messages from globalStackListDigestMessages
                bSendDigest = deleteObsoleteDigestMessages(messageDate - mainDelay);
            }

            // Generate Bot Answer
            if (bSendDigest) {
                var botAnswer = '';
                var endLineString = '\n';
                var stackSize = globalStackListDigestMessages.length;

                // Count of digest messages from one chat.
                var countOfDigestMessagesByChat = getCountDigestMessagesOfChat(messageChatId, dayDelay);

                // Check countOfDigestMessagesByChat.
                if (countOfDigestMessagesByChat > 0) {
                    // Append answer string.
                    // botAnswer += 'Hola amigos!\nThere is digest of this chat:\n';
                    for (var i = 0; i < stackSize; ++i) {
                        if (globalStackListDigestMessages[i].s_chatID === messageChatId) {
                            if (globalStackListDigestMessages[i].s_date > dayDelay) {
                                botAnswer += globalStackListDigestMessages[i].s_message + endLineString;
                            }
                        }
                    }

                    // Trim strings
                    botAnswer = botAnswer.trim();
                    botAnswer = trimAndRemoveAtInEachString(botAnswer);

                    // Capitalize first letter of each string
                    botAnswer = capitalizeFirstLetterOfEachString(botAnswer);

                    // Replace all line breaks by line break, digestMarker and space.
                    botAnswer = catchPhrases.digestMarker + ' '
                            + replaceLineBreaksByYourString(botAnswer, '\n' + catchPhrases.digestMarker + ' ');

                    // Add digest header
                    botAnswer = getDigestReportHeader() + botAnswer;

                    // Send botAnswer as chunks
                    sendChunksMessagesByBot(messageChatId, botAnswer, 3500);
                } else {
                    sendNoDigestMessages(messageChatId);
                }
            } else {
                sendNoDigestMessages(messageChatId);
            }
        } else {
            sendMessageByBot(messageChatId, catchPhrases.helpCommand[2]);
        }
    }



    if (messageText === '/aga') {
        var stringAmount = getRandomInt(5, 20);
        for (var i = 0; i < stringAmount; i++) {
            var stringAnswer = '';
            var agaAmount = getRandomInt(1, 6);
            for (var j = 0; j < agaAmount; j++) {
                stringAnswer += 'ага';
            }
            sendMessageByBot(messageChatId, stringAnswer);
        }
    }

    // ADMINISTRATION COMMANDS
    // SEND COMMAND
    if (messageText.indexOf('/send') === 0) {
        if (getAdminRights()) {
            messageText = messageText.trim();
            var splitSendList = messageText.split(' ');
            if (splitSendList.length > 2) {
                var targetChatID = splitSendList[1];
                sendMessageByBot(targetChatID, getSendMessage(messageText, '/send ' + targetChatID), true);
            } else {
                sendMessageByBot(messageChatId,
                                 catchPhrases.debugCommandMessages[8]);
            }
        } else {
            sendNoAccessMessage(messageChatId);
        }
    }

    // STICKER COMMAND
    if (messageText.indexOf('/sticker') === 0 || messageText.indexOf('/sticker@'+globalBotUserName) === 0) {
        if (getAdminRights()) {
            messageText = messageText.trim();
            var splitCommandListSticker = messageText.split(' ');
            if (splitCommandListSticker.length === 3) {
                var targetStickerChatID = splitCommandListSticker[1];
                console.log(messageChatId, "Message CHAT ID");
                Request.head(splitCommandListSticker[2], function(aErr, aRes, aBody) {
                    Request(splitCommandListSticker[2]).pipe(FileSystem.createWriteStream('sticker.webp')).on('close', function() {
                        sendSticker(targetStickerChatID, 'sticker.webp');
                    });
                });
            }
        } else {
            sendNoAccessMessage(messageChatId);
        }
    }

    // CLEARSTACK COMMAND
    if (messageText === '/stackClear' || messageText === '/clearStack') {
        if (getAdminRights()) {
            globalStackListDigestMessages = [ ];
            sendMessageByBot(messageChatId,
                             catchPhrases.debugCommandMessages[1]);
        } else {
            sendNoAccessMessage(messageChatId);
        }
    }

    // COUNT COMMAND
    if (messageText === '/count') {
        if (getAdminRights()) {
            sendMessageByBot(messageChatId,
                             catchPhrases.debugCommandMessages[4] + globalCountOfMessagesWithDigest);
        } else {
            sendNoAccessMessage(messageChatId);
        }
    }

    // DELETE COMMAND
    if (messageText.indexOf('/delete') === 0) {
        if (getAdminRights()) {
            var stackLength = globalStackListDigestMessages.length;
            if (stackLength > 0) {
                var chunksMsg = messageText.split(' ');
                if (chunksMsg.length === 2) {
                    var delArg = parseInt(chunksMsg[1]);
                    if (delArg <= stackLength) {
                        globalStackListDigestMessages.splice(delArg - 1, 1);
                        sendMessageByBot(messageChatId, catchPhrases.debugCommandMessages[6] + ' ' + delArg + '.');
                    } else {
                        sendMessageByBot(messageChatId, catchPhrases.debugCommandMessages[7] + ' ' + delArg + '.');
                    }
                }
            } else {
                sendMessageByBot(messageChatId,
                                 catchPhrases.debugCommandMessages[2]);
            }
        } else {
            sendNoAccessMessage(messageChatId);
        }
    }

    // VIEWSTACK COMMAND
    if (messageText === '/stackView' || messageText === '/viewStack') {
        if (getAdminRights()) {
            var stack = '\n';
            var sizeOfStack = globalStackListDigestMessages.length;
            if (sizeOfStack > 0) {
                for (var j = 0; j < sizeOfStack; ++j) {
                    stack += j + 1 + ' ';
                    stack += globalStackListDigestMessages[j].s_chatID + ' ';
                    stack += globalStackListDigestMessages[j].s_username + ' ';
                    stack += globalStackListDigestMessages[j].s_date + ' ';
                    stack += globalStackListDigestMessages[j].s_message + '\n';
                }
                sendChunksMessagesByBot(messageChatId,
                                        catchPhrases.debugCommandMessages[3] + stack, 3500);
            } else {
                sendMessageByBot(messageChatId,
                                 catchPhrases.debugCommandMessages[2]);
            }
        } else {
            sendNoAccessMessage(messageChatId);
        }
    }

    // SAVESTACK COMMAND
    if (messageText === '/stackSave' || messageText === '/saveStack') {
        if (getAdminRights()) {
            writeJSONFileToFileSystem(globalJsonStackName, messageChatId, true);
        } else {
            sendNoAccessMessage(messageChatId);
        }
    }

    // RESTORESTACK COMMAND
    if (messageText === '/stackRestore' || messageText === '/restoreStack') {
        if (getAdminRights()) {
            readSavedStackFromFileSystem(globalJsonStackName, messageChatId, false);
        } else {
            sendNoAccessMessage(messageChatId);
        }
	}

    console.log(msg);
});



function generateChartsHelpString() {
    var helpChartsAnswer = '';
    for (var i = 0; i < catchPhrases.chartHelp.length; ++i) {
        helpChartsAnswer += catchPhrases.chartHelp[i] + '\n';
    }
    // Delete last line break
    helpChartsAnswer.trim();

    return helpChartsAnswer;
}

function downloadImageAndSendToChat(aUri, aFileName, aChatId, aChart, aDesc) {
    Request.head(aUri, function(aErr, aRes, aBody) {
        Request(aUri).pipe(FileSystem.createWriteStream(aFileName)).on('close', function() {
            if (aChart) {
                sendChartFileToChat(aChatId, aFileName);
            } else {
                bot.sendPhoto(aChatId, aFileName, { caption: aDesc, reply_to_message_id: globalMessageIdForReply });
            }
        });
    });
}

function sendSticker(aChatId, aStickerName) {
    if (aStickerName) {
    	console.log("_______________________________________");
    	console.log("aChatId: %s", aChatId);
    	console.log("aStickerName: %s", aStickerName);
        bot.sendSticker(aChatId, aStickerName, { reply_to_message_id: globalMessageIdForReply });
        console.log("%s", globalMessageIdForReply);
        console.log("_____");
    }
}

function sendChartFileToChat(aChatId, aImageName) {
    if (aImageName) {
        bot.sendPhoto(aChatId, aImageName,
                      { caption: catchPhrases.debugCommandMessages[9] + ' ' + globalExchange.desc, reply_to_message_id: globalMessageIdForReply });
    }
}

function sendChartToChat(aChatId, aExchangeId) {
    if (globalExchangeList[aExchangeId]) {
        globalExchange = globalExchangeList[aExchangeId];
        downloadImageAndSendToChat(globalExchangeList[aExchangeId].url,
                                   addYourStringToString('./', aExchangeId + '_image.png'),
                                   aChatId,
                                   true, null);
    } else {
        sendMessageByBot(aChatId,
                         generateChartsHelpString());
    }
}

function sendChunksMessagesByBot(aChatId, aMesssage, aChunkSize) {
    for (var j = 0, botAnswerLength = aMesssage.length; j < botAnswerLength; j+=aChunkSize) {
        sendMessageByBot(aChatId,  aMesssage.substring(j, j + aChunkSize));
    }
}

function generateHelpString() {
    var botAnswer = '';
    for (var i = 0; i < catchPhrases.helpCommand.length; ++i) {
        botAnswer += catchPhrases.helpCommand[i] + '\n';
    }

    if (getAdminRights()) {
        for (var j = 0; j < catchPhrases.helpCommandAdmin.length; ++j) {
            botAnswer += catchPhrases.helpCommandAdmin[j] + '\n';
        }
    }
    // Delete last line break
    botAnswer.trim();

    return botAnswer;
}

function sendNoAccessMessage(aChatId) {
    sendMessageByBot(aChatId, catchPhrases.debugCommandMessages[0]);
}

function getMessageDelay(aCountOfDay) {
    // 86 400 for 24-hours.
    return aCountOfDay * 86400;
}

function getSendMessage(aString, aTrim) {
    return aString.replace(aTrim, '').trim();
}

function trimAndRemoveAtInEachString(aString) {
    return aString.split('\n').map(function(aLine)
    {
        aLine = aLine.trim();

        // Remove username URI only
        aLine = splitLineToWords(aLine);

        return aLine;
    }).join('\n');
}

function splitLineToWords(aString) {
    return aString.split(' ').map(function(aWord)
    {
        if (aWord.indexOf('@') >= 0) {
            if (!validateEmail(aWord)) {
                aWord = aWord.replace(/@/g, '');
            }
        }
        return aWord;
    }).join(' ');
}

function validateEmail(aEmail) {
    return /\S+@\S+\.\S+/.test(aEmail);
}

function capitalizeFirstLetterOfEachString(aString) {
    return aString.split('\n').map(function(aLine)
    {
        if (aLine && aLine.indexOf('http') !== 0) {
            aLine = aLine[0].toUpperCase() + aLine.substr(1);
        }
        return aLine;
    }).join('\n');
}

function replaceLineBreaksByYourString(aString, aYourString) {
    return aString.replace(/(?:\r\n|\r|\n)/g, aYourString);
}

function getAdminRights() {
	console.log("my_user_name:%s", globalUserNameIs);
    return globalUserNameIs === 'pigunther';
}

function getDigestReportHeader() {
    return catchPhrases.digestCommandHello[getRandomInt(0, catchPhrases.digestCommandHello.length - 1)]
            + '\n'
            + catchPhrases.digestCommandHeader[getRandomInt(0, catchPhrases.digestCommandHeader.length - 1)]
            + '\n';
}

function sendNoDigestMessages(aChatId) {
    sendMessageByBot(aChatId,
                     catchPhrases.digestCommandNoMessages[
                         getRandomInt(0, catchPhrases.digestCommandNoMessages.length - 1)]);
}

function sendMessageByBot(aChatId, aMessage, aSendMessageToAnotherChat) {
    if (aChatId && aMessage) {
        // Replace '%username%' by userName.
        var readyMessage = aMessage.replace('%username%', '@' + globalUserNameIs);
        bot.sendMessage(aChatId, readyMessage, { disable_web_page_preview: true, reply_to_message_id: (aSendMessageToAnotherChat) ? null : globalMessageIdForReply });
    }
}

function getRandomInt(aMin, aMax) {
    return Math.floor(Math.random() * (aMax - aMin + 1)) + aMin;
}

function getCountDigestMessagesOfChat(aChatId, aObsoleteDate) {
    var stackSize = globalStackListDigestMessages.length;
    var countOfMessages = 0;
    for (var i = 0; i < stackSize; ++i) {
        if (globalStackListDigestMessages[i].s_chatID === aChatId) {
            if (globalStackListDigestMessages[i].s_date > aObsoleteDate) {
                countOfMessages++;
            }
        }
    }
    return countOfMessages;
}

function deleteObsoleteDigestMessages(aObsoleteDate) {
    var stackSize = globalStackListDigestMessages.length;

    var position = 0;
    for (var i = 0; i < stackSize; ++i) {
        if (globalStackListDigestMessages[i].s_date < aObsoleteDate) {
            position++;
        }
    }

    // All stack digest messages are obsolete.
    // Drop stack.
    if (position == stackSize) {
        globalStackListDigestMessages = [ ];
        return false;
    }

    // All stack digest messages are relevant.
    // Print them.
    if (position == 0) {
        return true;
    }

    // Replace current digest stack by sliced.
    globalStackListDigestMessages = globalStackListDigestMessages.slice(position);

    // Return true if stack not empty
    return stackSize > 0;
}

function normalizeMessage(aMessage) {
    var normalMessage = '';

    if (!isEmpty(aMessage)) {
        // Delete #digest tag from message
        normalMessage = aMessage.replace('#digest', '');

        // Delete %username% variable
        if (!(isBlank(normalMessage))) {
            normalMessage = normalMessage.replace('%username%', '');
        }

        // Ttrim all trailing spaces
        if (!(isBlank(normalMessage))) {
            normalMessage = normalMessage.trim();
        }

        // Replace multiple spaces with a single space
        if (!(isBlank(normalMessage))) {
            normalMessage = normalMessage.replace(/  +/g, ' ');
        }

        // Replace multiple line breaks with a single line break
        if (!(isBlank(normalMessage))) {
            normalMessage = normalMessage.replace(/\n{2,}/g, '\n');
        }
    }

    return normalMessage;
}

function isEmpty(aString) {
    return (!aString || 0 === aString.length);
}

function isBlank(aString) {
    return (!aString || /^\s*$/.test(aString));
}

function getTokenAccess() {
    var parsedJsonFromFile = getJSONFileFromFileSystem('BOT_TOKEN_ACCESS.json');
    var token = parsedJsonFromFile.botTokenAccess;
    console.log("token in functionAccess %s", token);
    if (token === null) { //don't know, mb undefined 
        console.error('Error: Token is empty!\nPlease write your token in \'BOT_TOKEN_ACCESS.json\' file.');
        process.exit(1);
        return false;
    }

    return token;
}

function getCatchPhrases() {
    return getJSONFileFromFileSystem('CatchPhrases.json');
}

function readSavedStackFromFileSystem(aFileName, aMessageId, aFirstRun) {
    var dotSlashName = addYourStringToString('./', aFileName);
    FileSystem.readFile(dotSlashName, 'utf-8', function(aError, aData) {
        if (aError) {
            if (!aFirstRun) {
                sendMessageByBot(aMessageId,
                                 catchPhrases.fileCommand[3]);
            }
            return aError;
        }
        if (!aFirstRun) {
            sendMessageByBot(aMessageId,
                             catchPhrases.fileCommand[1]);
        }
        globalStackListDigestMessages = JSON.parse(aData);
    });
}

function getJSONFileFromFileSystem(aFileName) {
    var dotSlashName = addYourStringToString('./', aFileName);
    console.log("dotSlashName: %s", dotSlashName);
    return JSON.parse(FileSystem.readFileSync(dotSlashName, 'utf-8'));
    
}

function writeJSONFileToFileSystem(aFileName, aMessageChatId, aAdmin) {
    if (globalStackListDigestMessages.length > 0) {
        var dotSlashName = addYourStringToString('./', aFileName);
        FileSystem.writeFile(dotSlashName, JSON.stringify(globalStackListDigestMessages, null, 4), function(aError) {
            if (aAdmin) {
                if (aError) {
                    sendMessageByBot(aMessageChatId,
                                     catchPhrases.fileCommand[2] + '\n' + aError);
                } else {
                    sendMessageByBot(aMessageChatId,
                                     catchPhrases.fileCommand[0]);
                }
            }
        });
    } else {
        if (aAdmin) {
            sendMessageByBot(aMessageChatId,
                             catchPhrases.debugCommandMessages[2]);
        }
    }
}

function addYourStringToString(aYourString, aString) {
    return aYourString + aString;
}
