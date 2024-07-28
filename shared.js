function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of cardValues) {
            deck.push(value + suit);
        }
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateUI() {
    const communityCardsToShow = currentBettingRound > 0 ? communityCards.slice(0, 3 + currentBettingRound) : communityCards.map(() => 'back');
    document.getElementById('community-cards').innerHTML = 'Cartas comunitárias: ' +
        communityCardsToShow.map(formatCard).join('');
    const playerAreas = players.map((player, index) => {
        const playerChips = player.chips !== undefined && !isNaN(player.chips) && player.chips >= 0 ? player.chips : 0;
        return `
            <div class="player-area ${index === currentPlayerIndex ? 'current-player' : ''} ${player.folded ? 'folded-player' : ''}">
                <strong>${player.name}</strong> (${playerChips} fichas)
                ${player.folded ? ' (Desistiu)' : ''}
                ${index === currentPlayerIndex ? ' (Jogando)' : ''}
                <br>
                Mão: ${player.hand.map(card => card === 'back' ? formatCard(card) : formatCard(card)).join('')}
                <br>
                Aposta atual: ${player.bet || 0}
            </div>
        `;
    });

    document.getElementById('players').innerHTML = `
        <div>${playerAreas[0]}</div>
        <div>${playerAreas[1]}</div>
        <div>${playerAreas[2]}</div>
        <div>${playerAreas[3]}</div>
    `;
    document.getElementById('pot').innerHTML = `Pote: ${pot}`;
    document.getElementById('betting-round').innerHTML = `Rodada de apostas: ${['Pré-flop', 'Flop', 'Turn', 'River'][currentBettingRound]}`;
    const currentPlayer = players[currentPlayerIndex];
    const canCheck = currentPlayer.bet === currentBet;
    document.getElementById('check').disabled = !canCheck || !currentPlayer.isHuman;
    document.getElementById('call').disabled = canCheck || !currentPlayer.isHuman;
    document.getElementById('bet').disabled = !currentPlayer.isHuman;
    document.getElementById('bet-amount').disabled = !currentPlayer.isHuman;
    document.getElementById('fold').disabled = !currentPlayer.isHuman;
}

function formatCard(card) {
    if (card === 'back') {
        return '<div class="card-back" style="display: inline-block;"></div>';
    } else {
        const isRed = card.includes('♥') || card.includes('♦');
        return `<div class="card ${isRed ? 'red' : ''}">${card}</div>`;
    }
}

function startInitialBettingRound() {
    currentPlayerIndex = 0; // Start with the human player
    updateUI();
    if (!players[currentPlayerIndex].isHuman) {
        setTimeout(computerAction, 1000);
    }
}
