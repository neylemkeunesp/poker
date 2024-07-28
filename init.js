import { dealCards } from './shared.js';

const suits = ['♠', '♥', '♦', '♣'];
        const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        let deck = [];
        let communityCards = [];
        let players = [];
        let currentPlayerIndex = 0;
        let pot = 0;
        let currentBet = 0;
        let currentBettingRound = 0;

import { createDeck, shuffle, updateUI, formatCard, startInitialBettingRound, checkSinglePlayerLeft, endGame, nextPlayer, checkRoundEnd, placeBet, evaluateHand } from './shared.js';

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
                setTimeout(computerAction, 1000);
            }
        }



        function computerAction() {
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

        function showdown() {

            const activePlayers = players.filter(p => !p.folded);
            const handStrengths = activePlayers.map(player => ({
                player,
                ...evaluateHand(player.hand, communityCards)
            }));

            handStrengths.sort((a, b) => b.strength - a.strength);

            const winner = handStrengths.length > 0 ? handStrengths[0].player : null;
            if (!winner) {
                console.error("No winner found. Check the handStrengths array:", handStrengths);
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

        function simulateGame() {
            dealCards();
            setTimeout(() => {
                function gameLoop() {
                    if (!checkSinglePlayerLeft() && currentBettingRound < 4) {
                        if (players[currentPlayerIndex].isHuman) {
                            // Simulate human player actions
                            if (Math.random() < 0.5) {
                                document.getElementById('check').click();
                            } else {
                                document.getElementById('bet').click();
                            }
                        } else {
                            computerAction();
                        }
                        setTimeout(gameLoop, 1000); // Continue the game loop
                    } else {
                        if (!checkSinglePlayerLeft()) {
                            showdown();
                        }
                    }
                }
                gameLoop();
            }, 1000);
        }
