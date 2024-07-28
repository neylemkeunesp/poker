function dealCards() {
    createDeck();
    shuffle(deck);

    players = [
        { name: "Você", hand: [], chips: 1000, bet: 0, folded: false, isHuman: true },
        { name: "Computador 1", hand: [], chips: 1000, bet: 0, folded: false, isHuman: false },
        { name: "Computador 2", hand: [], chips: 1000, bet: 0, folded: false, isHuman: false },
        { name: "Computador 3", hand: [], chips: 1000, bet: 0, folded: false, isHuman: false }
    ];

    communityCards = deck.slice(0, 5);
    deck = deck.slice(5);

    pot = 0;
    currentBet = 0;
    currentBettingRound = 0;
    currentPlayerIndex = 1; // Start with the player after the dealer

    updateUI();
    setTimeout(startInitialBettingRound, 1000); // Delay to show initial bets
}
