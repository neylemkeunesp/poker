import { createDeck, shuffle, updateUI, formatCard, checkSinglePlayerLeft, endGame, nextPlayer, checkRoundEnd, placeBet, evaluateHand, computerAction, showdown, dealCards, startInitialBettingRound } from './shared.js';

const suits = ['♠', '♥', '♦', '♣'];
const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let communityCards = [];
import { players, startBettingRound } from './shared.js';
let currentPlayerIndex = 0;
let pot = 0;
let currentBet = 0;
let currentBettingRound = 0;

function simulateGame() {
    // Add the logic for simulating the game here
    console.log("Simulating game...");
}

function startNewGame() {
    // Add the logic for starting a new game here
    console.log("Starting new game...");
    if (players.length === 0) {
        console.error("No players available to start the game.");
        return;
    }
    deck = createDeck();
    if (deck.length > 0) {
        shuffle(deck);
    } else {
        console.error("Deck is empty, cannot shuffle.");
    }
    communityCards = [];
    players.forEach(player => {
        player.hand = [];
        player.bet = 0;
        player.folded = false;
    });
    pot = 0;
    currentBet = 0;
    currentBettingRound = 0;
    currentPlayerIndex = 0;
    startInitialBettingRound();
}

document.getElementById('new-game').addEventListener('click', startNewGame);

function validateCurrentPlayer() {
    if (players.length === 0 || currentPlayerIndex < 0 || currentPlayerIndex >= players.length) {
        throw new Error("Invalid current player index or empty players array.");
    }
}






        function logGameResult(resultMessage) {
            console.log(resultMessage.replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''));
        }

        document.getElementById('deal').addEventListener('click', dealCards);
        document.getElementById('check').addEventListener('click', () => nextPlayer());
        document.getElementById('call').addEventListener('click', () => placeBet(currentBet - players[currentPlayerIndex].bet));
        document.getElementById('bet').addEventListener('click', () => {
            const betAmount = parseInt(document.getElementById('bet-amount').value);
            placeBet(currentBet - players[currentPlayerIndex].bet + betAmount);
        });
        document.getElementById('fold').addEventListener('click', () => {
            players[currentPlayerIndex].folded = true;
            nextPlayer();
        });

