module.exports = {
  config: {
    name: "slot",
    aliases: ["slots", "slotmachine"],
    version: "1.4",
    author: "--USER--",
    role: 0,
    shortDescription: {
      en: "Play a slot machine game with a spinning animation and betting."
    },
    longDescription: {
      en: "Bet an amount to spin the slot machine. Watch the spinning animation and see if you win!"
    },
    category: "Fun",
    guide: {
      en: "Use {p}slot <amount> to bet on the slot machine game."
    }
  },
  onStart: async function ({ api, event, getUserData, updateUserData }) {
    // Parse the bet amount from the command arguments
    const args = event.body.trim().split(/ +/).slice(1);
    const betAmount = parseInt(args[0], 10);

    if (isNaN(betAmount) || betAmount <= 0) {
      return api.sendMessage("Please enter a valid bet amount.", event.threadID);
    }

    // Retrieve user data and check if the user has enough balance
    const userData = await getUserData(event.senderID);
    if (!userData || userData.balance < betAmount) {
      return api.sendMessage("You don't have enough coins to place this bet.", event.threadID);
    }

    // Send an initial spinning message
    let spinningMessage = await api.sendMessage("Spinning... 🍒 🍋 🍊", event.threadID);

    // Define slot symbols and delay for the spinning effect
    const symbols = ["🍒", "🍋", "🍊", "🍉", "🍇", "🍓", "7️⃣"];
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Simulate the spinning animation
    for (let i = 0; i < 10; i++) {
      const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
      const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
      const slot3 = symbols[Math.floor(Math.random() * symbols.length)];
      api.sendMessage(`Spinning... ${slot1} ${slot2} ${slot3}`, event.threadID, spinningMessage.messageID);
      await delay(100); // Adjust delay to 100 ms for faster spinning
    }

    // Generate final slot result
    const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
    const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

    // Define prize amounts
    const prizes = {
      jackpot: betAmount * 10,  // Jackpot payout
      twoMatching: betAmount * 2, // Payout for two matching symbols
      none: 0 // No payout for no matches
    };

    // Determine the result
    let resultMessage;
    let payout = 0;

    if (slot1 === slot2 && slot2 === slot3) {
      resultMessage = `🎉 Congratulations! You hit the jackpot! ${slot1} ${slot2} ${slot3}`;
      payout = prizes.jackpot;
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      resultMessage = `✨ Almost! You got two matching symbols. ${slot1} ${slot2} ${slot3}`;
      payout = prizes.twoMatching;
    } else {
      resultMessage = `😢 Better luck next time! ${slot1} ${slot2} ${slot3}`;
      payout = -betAmount; // Loss amount
    }

    // Update user data with the result
    userData.balance = (userData.balance || 0) + payout;
    await updateUserData(event.senderID, userData);

    // Send the final result message
    resultMessage += payout > 0 ? `\nYou won ${payout} coins!` : `\nYou lost ${-payout} coins.`;
    api.sendMessage(resultMessage, event.threadID);

    // Delete the spinning message to clean up
    api.deleteMessage(spinningMessage.messageID);
  }
};
