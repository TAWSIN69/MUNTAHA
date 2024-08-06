module.exports = {
  config: {
    name: "slot",
    version: "1.4",
    author: "--USER--",
    shortDescription: {
      en: "Slot game",
    },
    longDescription: {
      en: "Slot game.",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to have a chance to win double",
      not_enough_money: " areh areh apni dekhi Amar thekeu gorib 😅",
      spin_message: "Spinning...",
      win_message: " wow apni dekhi borolok Hoye jacchen , to Amar pawna taka ta Kobe diben $%1, !",
      lose_message: "You lost $%1, haha abar gorib Hoye geso Amar moto 🐸.",
      jackpot_message: "Jackpot! Apnar moto borolok ekjon ke biye Korte chai Ami 💗You won $%1 with three %2 symbols, buddy!",
    },
  },
  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);
 
    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }
 
    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }
 
    const fruitEmojis = ["🍒", "🍇", "🍊", "🍉", "🍎", "🍓", "🍏", "🍌"];
 
    const slots = [];
    for (let i = 0; i < 10; i++) {
      const slot1 = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
      const slot2 = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
      const slot3 = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
      slots.push([slot1, slot2, slot3]);
    }
 
    const finalSlot1 = Math.random() < 0.05 ? "🍒" : fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
    const finalSlot2 = Math.random() < 0.3 ? "🍒" : fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
    const finalSlot3 = Math.random() < 0.02 ? "🍒" : fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)];
 
    const finalSlots = [finalSlot1, finalSlot2, finalSlot3];
 
    slots.push(finalSlots);
 
    let msg = await message.reply(getLang("spin_message"));
 
    for (let i = 0; i < slots.length; i++) {
      const slotDisplay = `🎰 | ${slots[i][0]} | ${slots[i][1]} | ${slots[i][2]} |`;
      await msg.edit(slotDisplay);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
 
    const winnings = calculateWinnings(finalSlot1, finalSlot2, finalSlot3, amount);
 
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });
 
    const messageText = getSpinResultMessage(finalSlot1, finalSlot2, finalSlot3, winnings, getLang);
    return msg.edit(messageText);
  },
};
 
function calculateWinnings(slot1, slot2, slot3, betAmount) {
  if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
    return betAmount * 3; 
  } else if (slot1 === "🍇" && slot2 === "🍇" && slot3 === "🍇") {
    return betAmount * 2; 
  } else if (slot1 === slot2 && slot2 === slot3) {
    return betAmount * 1.8; 
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return betAmount * 1.5;  
  } else {
    return -betAmount;
  }
}
 
function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  if (winnings > 0) {
    if (slot1 === "🍓" && slot2 === "🍓" && slot3 === "🍓") {
      return getLang("jackpot_message", winnings, "🍓");
    } else {
      return getLang("win_message", winnings) + ` [ ${slot1} | ${slot2} | ${slot3} ]`;
    }
  } else {
    return getLang("lose_message", -winnings) + ` [ ${slot1} | ${slot2} | ${slot3} ]`;
  }
}
