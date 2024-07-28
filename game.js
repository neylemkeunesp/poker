import { dealCards } from './shared.js';


            document.getElementById('simulate').addEventListener('click', simulateGame);
            players.forEach(player => {
                player.hand = [];
                player.bet = 0;
                player.folded = false;
            });
            pot = 0;
            currentBet = 0;
            currentBettingRound = 0;
            currentPlayerIndex = 0;
            // Human player places an initial bet of 10
            const humanPlayer = players.find(player => player.isHuman);
            if (humanPlayer) {
                placeBet(10);
            }

        document.getElementById('new-game').addEventListener('click', startNewGame);
        const suits = ['♠', '♥', '♦', '♣'];
        const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let deck = [];
        let communityCards = [];
        let players = [];
        let currentPlayerIndex = 0;
        let pot = 0;
        let currentBet = 0;
        let currentBettingRound = 0;

import { createDeck, shuffle, updateUI, formatCard, startInitialBettingRound, checkSinglePlayerLeft, endGame, nextPlayer, checkRoundEnd, placeBet, evaluateHand, computerAction, showdown } from './shared.js';

        function startBettingRound() {
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
                //setTimeout(computerAction, 1000);
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
        function getBestHand(allCards, valueCounts, suitCounts, handType) {
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

