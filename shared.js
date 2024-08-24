const suits = ['♠', '♥', '♦', '♣'];
const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export let deck = [];
let communityCards = [];
export let players = [
    { name: 'Player 1', isHuman: true, hand: [], bet: 0, folded: false, chips: 1000 },
    { name: 'Player 2', isHuman: false, hand: [], bet: 0, folded: false, chips: 1000 },
    { name: 'Player 3', isHuman: false, hand: [], bet: 0, folded: false, chips: 1000 },
    { name: 'Player 4', isHuman: false, hand: [], bet: 0, folded: false, chips: 1000 }
];
let currentBet = 0;
let currentPlayerIndex = 0;
let currentBettingRound = 0;
let pot = 0;

function validateCurrentPlayer() {
    if (players.length === 0 || currentPlayerIndex < 0 || currentPlayerIndex >= players.length) {
        throw new Error("Invalid current player index or empty players array.");
    }
}

export function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of cardValues) {
            deck.push(value + suit);
        }
    }
}

export function dealCards() {
    communityCards = [deck.pop(), deck.pop(), deck.pop(), deck.pop(), deck.pop()];
    updateUI();
}

export function shuffle(array) {
    if (!array || array.length === 0) {
        console.error("Cannot shuffle an empty or undefined array.");
        return;
    }
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function updateUI() {
    const communityCardsToShow = currentBettingRound > 0 ? communityCards.slice(0, 3 + currentBettingRound) : communityCards.map(() => 'back');
    document.getElementById('community-cards').innerHTML = 'Cartas comunitárias: ' +
        communityCardsToShow.map(formatCard).join('');
    const playerAreas = players.map((player, index) => {
        const playerChips = player.chips !== undefined && !isNaN(player.chips) && player.chips >= 0 ? player.chips : 0;
        return `
            <div class="player-area ${index === currentPlayerIndex ? 'current-player' : ''} ${player.folded ? 'folded-player' : ''}">
                <strong>${player.name}</strong> (${playerChips.toFixed(2)} fichas)
                ${player.folded ? ' (Desistiu)' : ''}
                ${index === currentPlayerIndex ? ' (Jogando)' : ''}
                <br>
                Mão: ${player.hand.map(card => card === 'back' ? formatCard(card) : formatCard(card)).join('')}
                <br>
                Aposta atual: ${(player.bet || 0).toFixed(2)}
            </div>
        `;
    });

    document.getElementById('players').innerHTML = `
        <div>${playerAreas[0]}</div>
        <div>${playerAreas[1]}</div>
        <div>${playerAreas[2]}</div>
        <div>${playerAreas[3]}</div>
    `;
    document.getElementById('pot').innerHTML = `Pote: ${(pot || 0).toFixed(2)}`;
    document.getElementById('betting-round').innerHTML = `Rodada de apostas: ${['Pré-flop', 'Flop', 'Turn', 'River'][currentBettingRound]}`;
    const currentPlayer = players[currentPlayerIndex];
    validateCurrentPlayer();
    const canCheck = currentPlayer.bet === currentBet;
    document.getElementById('check').disabled = !canCheck || !currentPlayer.isHuman;
    document.getElementById('call').disabled = canCheck || !currentPlayer.isHuman;
    document.getElementById('bet').disabled = !currentPlayer.isHuman;
    document.getElementById('bet-amount').disabled = !currentPlayer.isHuman;
    document.getElementById('fold').disabled = !currentPlayer.isHuman;
}

export function formatCard(card) {
    if (!card) {
        return '<div class="card-placeholder" style="display: inline-block;"></div>';
    } else if (card === 'back') {
        return '<div class="card-back" style="display: inline-block;"></div>';
    } else {
        const isRed = card.includes('♥') || card.includes('♦');
        return `<div class="card ${isRed ? 'red' : ''}">${card}</div>`;
    }
}

export function startInitialBettingRound() {
    currentPlayerIndex = 0; // Start with the human player
    updateUI();
    if (!players[currentPlayerIndex].isHuman) {
        setTimeout(computerAction, 1000);
    }
}
export function startBettingRound() {
    for (let i = 0; i < players.length; i++) {
        if (players[i].isHuman) {
            players[i].hand = [deck.pop(), deck.pop()];
        } else {
            players[i].hand = ['back', 'back'];
        }
    }
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Move to the next player
    for (let player of players) {
        player.bet = 0;
    }
    currentBet = 0;
    updateUI();
    if (!players[currentPlayerIndex].isHuman) {
        setTimeout(computerAction, 1000);
    }
}

export function checkSinglePlayerLeft() {
    const activePlayers = players.filter(p => !p.folded);
    return activePlayers.length === 1;
}

export function endGame() {
    const winner = players.find(p => !p.folded);
    winner.chips += pot;
    document.getElementById('result').innerHTML = `${winner.name} ganhou o jogo com ${winner.chips} fichas restantes!`;
    updateUI();
}

export function nextPlayer() {
    do {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    } while (players[currentPlayerIndex].folded && players.some(p => !p.folded));

    if (checkSinglePlayerLeft()) {
        endGame();
    } else if (checkRoundEnd()) {
        if (currentBettingRound < 3) {
            currentBettingRound++;
            startBettingRound();
        } else {
            showdown();
        }
    } else {
        updateUI();
        if (!players[currentPlayerIndex].isHuman) {
            setTimeout(computerAction, 1000);
        }
    }
}

export function checkRoundEnd() {
    const activePlayers = players.filter(p => !p.folded);
    const allEqualBets = activePlayers.every(p => p.bet === currentBet);
    return allEqualBets;
}

export function placeBet(amount) {
    const player = players[currentPlayerIndex];
    const actualBet = Math.min(amount, player.chips !== undefined ? player.chips : 0);
    player.chips = Math.max(0, (player.chips !== undefined ? player.chips : 0) - actualBet);
    player.bet += actualBet;
    pot += actualBet;
    currentBet = Math.max(currentBet, player.bet);
    nextPlayer();
}
export function getBestHand(allCards, valueCounts, suitCounts, handType) {
    const cardValueOrder = cardValues.concat(cardValues).slice(0, 14); // To handle Ace as both high and low
    const sortedCards = allCards.sort((a, b) => cardValueOrder.indexOf(b.slice(0, -1)) - cardValueOrder.indexOf(a.slice(0, -1)));

    if (handType === 'Straight Flush' || handType === 'Flush') {
        const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
        return sortedCards.filter(card => card.endsWith(flushSuit)).slice(0, 5);
    }

    if (handType === 'Four of a Kind') {
        const fourValue = Object.keys(valueCounts).find(value => valueCounts[value] === 4);
        const kicker = sortedCards.find(card => !card.startsWith(fourValue));
        return sortedCards.filter(card => card.startsWith(fourValue)).concat(kicker).slice(0, 5);
    }

    if (handType === 'Full House') {
        const threeValue = Object.keys(valueCounts).find(value => valueCounts[value] === 3);
        const pairValue = Object.keys(valueCounts).find(value => valueCounts[value] === 2);
        return sortedCards.filter(card => card.startsWith(threeValue)).concat(sortedCards.filter(card => card.startsWith(pairValue)).slice(0, 2));
    }

    if (handType === 'Straight') {
        for (let i = 0; i < sortedCards.length - 4; i++) {
            const straight = sortedCards.slice(i, i + 5);
            const values = straight.map(card => cardValueOrder.indexOf(card.slice(0, -1)));
            if (values[0] - values[4] === 4) return straight;
        }
    }

    if (handType === 'Three of a Kind') {
        const threeValue = Object.keys(valueCounts).find(value => valueCounts[value] === 3);
        const kickers = sortedCards.filter(card => !card.startsWith(threeValue)).slice(0, 2);
        return sortedCards.filter(card => card.startsWith(threeValue)).concat(kickers);
    }

    if (handType === 'Two Pair') {
        const pairs = Object.keys(valueCounts).filter(value => valueCounts[value] === 2).sort((a, b) => cardValueOrder.indexOf(b) - cardValueOrder.indexOf(a));
        const kicker = sortedCards.find(card => !pairs.some(pair => card.startsWith(pair)));
        return sortedCards.filter(card => pairs.some(pair => card.startsWith(pair))).concat(kicker).slice(0, 5);
    }

    if (handType === 'One Pair') {
        const pairValue = Object.keys(valueCounts).find(value => valueCounts[value] === 2);
        const kickers = sortedCards.filter(card => !card.startsWith(pairValue)).slice(0, 3);
        return sortedCards.filter(card => card.startsWith(pairValue)).concat(kickers);
    }

    return sortedCards.slice(0, 5); // High Card
}

export function evaluateHand(hand, communityCards) {
    const allCards = [...hand, ...communityCards].filter(card => card !== undefined);
    
    const valueCounts = {};
    for (let card of allCards) {
        const value = card.slice(0, -1);
        valueCounts[value] = (valueCounts[value] || 0) + 1;
    }

    const suitCounts = {};
    for (let card of allCards) {
        const suit = card.slice(-1);
        suitCounts[suit] = (suitCounts[suit] || 0) + 1;
    }
    const hasFlush = Object.values(suitCounts).some(count => count >= 5);

    const uniqueValues = [...new Set(allCards.map(card => cardValues.indexOf(card.slice(0, -1))))];
    uniqueValues.sort((a, b) => a - b);
    let hasStrait = false;
    for (let i = 0; i < uniqueValues.length - 4; i++) {
        if (uniqueValues[i+4] - uniqueValues[i] === 4) {
            hasStrait = true;
            break;
        }
    }

    if (hasFlush && hasStrait) return { strength: 8, hand: getBestHand(allCards, valueCounts, suitCounts, 'Straight Flush') };
    if (Object.values(valueCounts).includes(4)) return { strength: 7, hand: getBestHand(allCards, valueCounts, suitCounts, 'Four of a Kind') };
    if (Object.values(valueCounts).includes(3) && Object.values(valueCounts).includes(2)) return { strength: 6, hand: getBestHand(allCards, valueCounts, suitCounts, 'Full House') };
    if (hasFlush) return { strength: 5, hand: getBestHand(allCards, valueCounts, suitCounts, 'Flush') };
    if (hasStrait) return { strength: 4, hand: getBestHand(allCards, valueCounts, suitCounts, 'Straight') };
    if (Object.values(valueCounts).includes(3)) return { strength: 3, hand: getBestHand(allCards, valueCounts, suitCounts, 'Three of a Kind') };
    if (Object.values(valueCounts).filter(count => count === 2).length === 2) return { strength: 2, hand: getBestHand(allCards, valueCounts, suitCounts, 'Two Pair') };
    if (Object.values(valueCounts).includes(2)) return { strength: 1, hand: getBestHand(allCards, valueCounts, suitCounts, 'One Pair') };
    return { strength: 0, hand: getBestHand(allCards, valueCounts, suitCounts, 'High Card') };
}
export function computerAction() {
    const player = players[currentPlayerIndex];
    const handStrength = evaluateHand(player.hand, communityCards.slice(0, 3 + currentBettingRound));
    const random = Math.random();

    let raiseChance, callChance;

    if (handStrength >= 5) {
        raiseChance = 0.7;
        callChance = 0.25;
    } else if (handStrength >= 3) {
        raiseChance = 0.4;
        callChance = 0.4;
    } else if (handStrength >= 1) {
        raiseChance = 0.2;
        callChance = 0.5;
    } else {
        raiseChance = 0.1;
        callChance = 0.3;
    }

    if (random < raiseChance) {
        const raiseAmount = Math.floor((handStrength + 1) * 10);
        placeBet(currentBet - player.bet + raiseAmount);
    } else if (random < raiseChance + callChance) {
        placeBet(currentBet - player.bet);
    } else {
        player.folded = true;
        nextPlayer();
    }
}








export function logGameResult(resultMessage) {
    console.log(resultMessage.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''));
}

export function showdown() {
    const activePlayers = players.filter(p => !p.folded);
    const handStrengths = activePlayers.map(player => {
        const { strength, hand } = evaluateHand(player.hand, communityCards);
        return { player, strength, hand };
    });

    handStrengths.sort((a, b) => b.strength - a.strength);

    const winner = handStrengths.length > 0 ? handStrengths[0].player : null;
    if (!winner) {
        console.error("No winner found. Check the handStrengths array:", handStrengths);
        return;
    }
    winner.chips += pot;

    let resultMessage = `Resultado do showdown:<br>${winner.name} ganhou ${pot} fichas com `;
    resultMessage += handStrengths.map(hs => `<br>${hs.player.name} tinha ${hs.player.hand.map(formatCard).join('')} (Melhor mão: ${hs.hand.map(formatCard).join('')})`).join('');
    resultMessage += `<br>Cartas dos jogadores restantes:`;
    activePlayers.forEach(player => {
        resultMessage += `<br>${player.name}: ${player.hand.map(formatCard).join('')}`;
    });
    switch(handStrengths[0].strength) {
        case 8: resultMessage += "um Straight Flush!"; break;
        case 7: resultMessage += "uma Quadra!"; break;
        case 6: resultMessage += "um Full House!"; break;
        case 5: resultMessage += "um Flush!"; break;
        case 4: resultMessage += "um Straight!"; break;
        case 3: resultMessage += "uma Trinca!"; break;
        case 2: resultMessage += "Dois Pares!"; break;
        case 1: resultMessage += "um Par!"; break;
        case 0: resultMessage += "Carta Alta!"; break;
    }
    resultMessage += `<br>Melhor mão: ${handStrengths[0].hand.map(formatCard).join('')}`;
    document.getElementById('community-cards').innerHTML = 'Cartas comunitárias: ' + communityCards.map(formatCard).join('');
    document.getElementById('result').innerHTML = resultMessage;
    updateUI();
    logGameResult(resultMessage);
}
