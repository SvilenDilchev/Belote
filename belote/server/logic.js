const e = require("express");

const cardLibrary = {

    keyCounter: 0, // Initialize a key counter

    suits: ['Clubs', 'Diamonds', 'Hearts', 'Spades'],
    brSuits: ['Clubs', 'Diamonds', 'Spades', 'Hearts'],
    ranks: ['7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'],
    noTrumpRanks: ['7', '8', '9', 'Jack', 'Queen', 'King', '10', 'Ace'],
    allTrumpRanks: ['7', '8', 'Queen', 'King', '10', 'Ace', '9', 'Jack'],

    createCard: function (rank, suit, isTrump = false, isPlayable = false) {
        const card = {
            key: this.keyCounter++, // Assign the current key value and increment the counter
            rank,
            suit,
            isTrump,
            isPlayable
        };
        return card;
    },

    shuffleDeck(deck) {
        return deck.sort(() => Math.random() - 0.5);
    },

    sortDeckBySuits(deck) {
        return deck.sort((card1, card2) => {
            const suitIndex1 = this.brSuits.indexOf(card1.suit);
            const suitIndex2 = this.brSuits.indexOf(card2.suit);
            return suitIndex1 - suitIndex2;
        });
    },

    sortDeckByPokerOrder(deck) {
        const sortedDeck = [];
        for (const suit of this.suits) {
            const suitCards = deck.filter(card => card.suit === suit);
            const sortedSuitCards = suitCards.sort((card1, card2) => {
                const rankIndex1 = this.ranks.indexOf(card1.rank);
                const rankIndex2 = this.ranks.indexOf(card2.rank);
                return rankIndex2 - rankIndex1; // Sort in reverse order
            });
            sortedDeck.push(...sortedSuitCards);
        }
        return sortedDeck;
    },

    sortDeckByNoTrumpRanks(deck) {
        const sortedDeck = [];
        for (const suit of this.suits) {
            const suitCards = deck.filter(card => card.suit === suit);
            const sortedSuitCards = suitCards.sort((card1, card2) => {
                const rankIndex1 = this.noTrumpRanks.indexOf(card1.rank);
                const rankIndex2 = this.noTrumpRanks.indexOf(card2.rank);
                return rankIndex2 - rankIndex1; // Sort in reverse order
            });
            sortedDeck.push(...sortedSuitCards);
        }
        return sortedDeck;
    },

    sortDeckByAllTrumpRanks(deck) {
        const sortedDeck = [];
        for (const suit of this.suits) {
            const suitCards = deck.filter(card => card.suit === suit);
            const sortedSuitCards = suitCards.sort((card1, card2) => {
                const rankIndex1 = this.allTrumpRanks.indexOf(card1.rank);
                const rankIndex2 = this.allTrumpRanks.indexOf(card2.rank);
                return rankIndex2 - rankIndex1; // Sort in reverse order
            });
            sortedDeck.push(...sortedSuitCards);
        }
        return sortedDeck;
    },

    resetCardsToPlayable(deck) {
        return deck.map(card => {
            card.isPlayable = true;
            return card;
        });
    },

    resetCardsToUnplayable(deck) {
        return deck.map(card => {
            card.isPlayable = false;
            return card;
        }
        );
    },


    setTrumps(deck, gameBid) {
        return deck.map(card => {
            if (card.suit === gameBid || gameBid === 'All Trumps') {
                card.isTrump = true;
            } else {
                card.isTrump = false;
            }
            return card;
        });
    },

    setCardValues(deck) {
        return deck.map(card => {
            switch (card.rank) {
                case '9':
                    card.isTrump ? card.value = 14 : card.value = 0;
                    break;
                case '10':
                    card.value = 10;
                    break;
                case 'Jack':
                    card.isTrump ? card.value = 20 : card.value = 2;
                    break;
                case 'Queen':
                    card.value = 3;
                    break;
                case 'King':
                    card.value = 4;
                    break;
                case 'Ace':
                    card.value = 11;
                    break;
                default:
                    card.value = 0;
                    break;
            }
            return card;
        });
    },

    countPoins(deck) {
        let points = 0;
        for (const card of deck) {
            points += card.value;
        }
        return points;
    },

    compareRankTrump(card1, card2) {
        const rankIndex1 = this.allTrumpRanks.indexOf(card1.rank);
        const rankIndex2 = this.allTrumpRanks.indexOf(card2.rank);
        return rankIndex2 - rankIndex1;
    },

    compareRankNonTrump(card1, card2) {
        const rankIndex1 = this.noTrumpRanks.indexOf(card1.rank);
        const rankIndex2 = this.noTrumpRanks.indexOf(card2.rank);
        return rankIndex2 - rankIndex1;
    }
};

const getBiddingResult = (gameData, io, passCount = 0, bidCount = 0, currentPlayerIndex = 0, gameBid = 'Pass', biddingPlayer = null, validBids = ['Clubs', 'Diamonds', 'Hearts', 'Spades', 'No Trumps', 'All Trumps'], multiplier = 1, bid = 'Pass', hasEmited = false) => {
    const processBidding = () => {
        const player = gameData.room.players.find(player => player.turn === currentPlayerIndex);
        const socket = io.sockets.sockets.get(player.socketID);
        io.to(player.socketID).emit('request_bid', player, validBids);

        socket.once('send_bid', (bid) => {
            bid = bid;
            tempBidInfo = {
                player: player,
                bid: bid
            }
            io.to(gameData.room.roomID).emit('update_temp_bid', (tempBidInfo));
            doubleBreak: if (bid === 'Pass') {
                passCount++;
            } else {
                bidCount++;
                passCount = 0;
                biddingPlayer = player;

                if (bid === 'Double') {
                    multiplier = 2;
                    validBids.push('Redouble');
                    validBids = validBids.filter(bid => bid !== 'Double');
                    break doubleBreak;
                } else if (bid === 'Redouble') {
                    multiplier = 4;
                    validBids = validBids.filter(bid => bid !== 'Redouble');
                    break doubleBreak;
                }
                multiplier = 1;

                gameBid = bid;
                const gameBidIndex = validBids.indexOf(gameBid);

                if (!validBids.includes('Double')) {
                    validBids.push('Double');
                }
                validBids = validBids.slice(gameBidIndex + 1);
            }

            currentPlayerIndex = ((currentPlayerIndex + 1) % 4);

            if (passCount < 4 && (bidCount === 0 || passCount < 3)) {
                processBidding(); // Call the function again to continue the bidding process
            } else {
                // Return the result when bidding is done
                if (!hasEmited) {
                    const biddingResult = {
                        gameBid: gameBid,
                        biddingPlayer: biddingPlayer,
                        multiplier: multiplier
                    }
                    io.to(gameData.room.roomID).emit('bidding_result', (biddingResult));
                    hasEmited = true;
                }

                return {
                    gameBid: gameBid,
                    biddingPlayer: biddingPlayer,
                    multiplier: multiplier
                };
            }
        });
    };

    processBidding(); // Start the bidding process
};

const updatePlayableCards = (gameBid, player, requestedSuit, winningCard, currentTaker, game) => {
    if (gameBid === 'All Trumps') {
        if (player.hand.some(card => card.suit === requestedSuit)) {
            let hasOverTrump = false;
            player.hand.forEach(card => {
                if (card.suit === requestedSuit && cardLibrary.compareRankTrump(winningCard, card) > 0) {
                    hasOverTrump = true;
                }
            });
            if (hasOverTrump) {
                player.hand.forEach(card => {
                    if (card.suit === requestedSuit && cardLibrary.compareRankTrump(winningCard, card) > 0) {
                        card.isPlayable = true;
                    }
                })
            } else {
                player.hand.forEach(card => {
                    if (card.suit === requestedSuit) {
                        card.isPlayable = true;
                    }
                });
            }
        } else {
            player.hand.forEach(card => {
                card.isPlayable = true;
            });
        }
    } else if (gameBid === 'No Trumps') {
        if (player.hand.some(card => card.suit === requestedSuit)) {
            player.hand.forEach(card => {
                if (card.suit === requestedSuit) {
                    card.isPlayable = true;
                } else {
                    card.isPlayable = false;
                }
            });
        } else {
            player.hand.forEach(card => {
                card.isPlayable = true;
            });
        }
    } else {
        if (player.hand.some(card => card.suit === requestedSuit)) {
            player.hand.forEach(card => {
                if (card.suit !== requestedSuit) {
                    card.isPlayable = false;
                }
            });
            if (requestedSuit === gameBid) {
                let hasOverTrump = false;
                player.hand.forEach(card => {
                    if (card.suit === requestedSuit && cardLibrary.compareRankTrump(winningCard, card) > 0) {
                        hasOverTrump = true;
                    }
                });
                if (hasOverTrump) {
                    player.hand.forEach(card => {
                        if (card.suit === requestedSuit && cardLibrary.compareRankTrump(winningCard, card) > 0) {
                            card.isPlayable = true;
                        } else {
                            card.isPlayable = false;
                        }
                    })
                } else {
                    player.hand.forEach(card => {
                        if (card.suit === requestedSuit) {
                            card.isPlayable = true;
                        } else {
                            card.isPlayable = false;
                        }
                    });
                }
            } else {
                player.hand.forEach(card => {
                    if (card.suit === requestedSuit) {
                        card.isPlayable = true;
                    } else {
                        card.isPlayable = false;
                    }
                });
            }
        } else {
            if (currentTaker.socketID !== game.getTeammate(player).socketID) {
                if (!player.hand.some(card => card.isTrump)) {
                    player.hand.forEach(card => {
                        card.isPlayable = true;
                    });
                } else {
                    if (winningCard.isTrump) {

                        let hasOverTrump = false;
                        player.hand.forEach(card => {
                            if (card.isTrump && cardLibrary.compareRankTrump(winningCard, card) > 0) {
                                hasOverTrump = true;
                            }
                        });

                        if (hasOverTrump) {
                            player.hand.forEach(card => {
                                if (card.isTrump && cardLibrary.compareRankTrump(winningCard, card) > 0) {
                                    card.isPlayable = true;
                                } else {
                                    card.isPlayable = false;
                                }
                            })
                        } else {
                            player.hand.forEach(card => {
                                card.isPlayable = true;
                            });
                        }
                    } else {
                        player.hand.forEach(card => {
                            if (card.isTrump) {
                                card.isPlayable = true;
                            } else {
                                card.isPlayable = false;
                            }
                        });
                    }
                }
            } else {
                player.hand.forEach(card => {
                    card.isPlayable = true;
                });
            }
        }
    }
}

const startPlayingRound = (game, io) => {
    for (const player of game.room.players) {
        cardLibrary.setTrumps(player.hand, game.roundBid);
    }
    for (const player of game.room.players) {
        cardLibrary.setCardValues(player.hand);
    }

    const first = game.room.players.find(player => player.turn === 0);
    setTrickTurns(game, first);
    startTrick(game, io, 0);

}

const startTrick = (game, io, trickNumber) => {
    var cardsPlayed = [];
    var winningCard = null;
    var currentTaker = null;
    var requestedSuit = null;
    var player = null;
    var selectedCardIndex = null;

    player = game.room.players.find(player => player.trickTurn === 0);
    cardLibrary.resetCardsToPlayable(player.hand);
    io.to(player.socketID).emit('ask_for_card', player);

    var socket = io.sockets.sockets.get(player.socketID);

    socket.once('t0_play_card', (card, player) => {
        data = {
            card: player.hand[card],
            player: player
        }
        cardsPlayed.push(data.card);
        winningCard = data.card;
        currentTaker = player;
        requestedSuit = data.card.suit;
        selectedCardIndex = card;
        player.hand.splice(card, 1);
        cardLibrary.resetCardsToUnplayable(player.hand);
        io.to(player.roomID).emit('display_card', (data));
        askP1(io, game, requestedSuit, winningCard);
    });

    function askP1(io, game, requestedSuit, winningCard) {
        var player = game.room.players.find(player => player.trickTurn === 1);
        updatePlayableCards(game.roundBid, player, requestedSuit, winningCard, currentTaker, game);
        io.to(player.socketID).emit('ask_for_card', player);
        var socket = io.sockets.sockets.get(player.socketID);
        socket.once('t1_play_card', (card, player) => {
            selectedCardIndex = card;
            data = {
                card: player.hand[card],
                player: player
            }
            player.hand.splice(selectedCardIndex, 1);
            cardsPlayed.push(data.card);
            if (game.roundBid === 'All Trumps') {
                if (data.card.suit === requestedSuit && cardLibrary.compareRankTrump(winningCard, data.card) > 0) {
                    winningCard = data.card;
                    currentTaker = player;
                }
            } else if (game.roundBid === 'No Trumps') {
                if (data.card.suit === requestedSuit && cardLibrary.compareRankNonTrump(winningCard, data.card) > 0) {
                    winningCard = data.card;
                    currentTaker = player;
                }
            } else {
                if (!winningCard.isTrump) {
                    if (!data.card.isTrump) {
                        if (data.card.suit === requestedSuit && cardLibrary.compareRankNonTrump(winningCard, data.card) > 0) {
                            winningCard = data.card;
                            currentTaker = player;
                        }
                    } else {
                        winningCard = data.card;
                        currentTaker = player;
                    }
                } else {
                    if (data.card.isTrump) {
                        if (cardLibrary.compareRankTrump(winningCard, data.card) > 0) {
                            winningCard = data.card;
                            currentTaker = player;
                        }
                    }
                }
            }
            cardLibrary.resetCardsToUnplayable(player.hand);
            io.to(player.roomID).emit('display_card', (data));
            askP2(io, game, requestedSuit, winningCard);
        });
    }

    function askP2(io, game, requestedSuit, winningCard) {
        player = game.room.players.find(player => player.trickTurn === 2);
        updatePlayableCards(game.roundBid, player, requestedSuit, winningCard, currentTaker, game);
        io.to(player.socketID).emit('ask_for_card', player);
        socket = io.sockets.sockets.get(player.socketID);
        socket.once('t2_play_card', (card, player) => {
            selectedCardIndex = card;
            data = {
                card: player.hand[card],
                player: player
            }
            player.hand.splice(selectedCardIndex, 1);
            cardsPlayed.push(data.card);
            if (game.roundBid === 'All Trumps') {
                if (data.card.suit === requestedSuit && cardLibrary.compareRankTrump(winningCard, data.card) > 0) {
                    winningCard = data.card;
                    currentTaker = player;
                }
            } else if (game.roundBid === 'No Trumps') {
                if (data.card.suit === requestedSuit && cardLibrary.compareRankNonTrump(winningCard, data.card) > 0) {
                    winningCard = data.card;
                    currentTaker = player;
                }
            } else {
                if (!winningCard.isTrump) {
                    if (!data.card.isTrump) {
                        if (data.card.suit === requestedSuit && cardLibrary.compareRankNonTrump(winningCard, data.card) > 0) {
                            winningCard = data.card;
                            currentTaker = player;
                        }
                    } else {
                        winningCard = data.card;
                        currentTaker = player;
                    }
                } else {
                    if (data.card.isTrump) {
                        if (cardLibrary.compareRankTrump(winningCard, data.card) > 0) {
                            winningCard = data.card;
                            currentTaker = player;
                        }
                    }
                }
            }

            cardLibrary.resetCardsToUnplayable(player.hand);
            io.to(player.roomID).emit('display_card', (data));
            askP3(io, game, requestedSuit, winningCard);
        });
    }

    function askP3(io, game, requestedSuit, winningCard) {
        player = game.room.players.find(player => player.trickTurn === 3);
        updatePlayableCards(game.roundBid, player, requestedSuit, winningCard, currentTaker, game);
        io.to(player.socketID).emit('ask_for_card', player);
        socket = io.sockets.sockets.get(player.socketID);
        socket.once('t3_play_card', (card, player) => {
            selectedCardIndex = card;
            data = {
                card: player.hand[card],
                player: player
            }
            player.hand.splice(selectedCardIndex, 1);
            cardsPlayed.push(data.card);
            if (game.roundBid === 'All Trumps') {
                if (data.card.suit === requestedSuit && cardLibrary.compareRankTrump(winningCard, data.card) > 0) {
                    winningCard = data.card;
                    currentTaker = player;
                }
            } else if (game.roundBid === 'No Trumps') {
                if (data.card.suit === requestedSuit && cardLibrary.compareRankNonTrump(winningCard, data.card) > 0) {
                    winningCard = data.card;
                    currentTaker = player;
                }
            } else {
                if (!winningCard.isTrump) {
                    if (!data.card.isTrump) {
                        if (data.card.suit === requestedSuit && cardLibrary.compareRankNonTrump(winningCard, data.card) > 0) {
                            winningCard = data.card;
                            currentTaker = player;
                        }
                    } else {
                        winningCard = data.card;
                        currentTaker = player;
                    }
                } else {
                    if (data.card.isTrump) {
                        if (cardLibrary.compareRankTrump(winningCard, data.card) > 0) {
                            winningCard = data.card;
                            currentTaker = player;
                        }
                    }
                }
            }
            cardLibrary.resetCardsToUnplayable(player.hand);
            io.to(player.roomID).emit('display_card', (data));
            addPoints();
        });
    }

    function addPoints() {
        const roundPoints = cardLibrary.countPoins(cardsPlayed);
        if (game.team1.player1.socketID === currentTaker.socketID || game.team1.player2.socketID === currentTaker.socketID) {
            game.team1.roundPoints += roundPoints;
        } else {
            game.team2.roundPoints += roundPoints;
        }
        endTrick();
    }
    function endTrick() {
        trickNumber++
        setTrickTurns(game, currentTaker);
        for (const player of game.room.players) {
            for (let i = 0; i < player.hand.length; i++) {
                const card = player.hand[i];
                for (const playedCard of cardsPlayed) {
                    if (card.key === playedCard.key) {
                        // Remove the card from player's hand
                        player.hand.splice(i, 1);
                        i--; // Adjust index because of splice
                        break; // Stop searching for this card in this player's hand
                    }
                }
            }
        }
        for (const player of game.room.players) {
            cardLibrary.resetCardsToUnplayable(player.hand);
        }
        cardsPlayed = [];

        if (trickNumber < 8) {
            setTimeout(() => {
                io.emit('reset_trick', game);
                startTrick(game, io, trickNumber);
            }, 3000);
        } else {
            if (game.team1.player1.socketID === currentTaker.socketID || game.team1.player2.socketID === currentTaker.socketID) {
                game.team1.roundPoints += 10;
            } else {
                game.team2.roundPoints += 10;
            }
            var roundResult = calculatePoints(game);

            if (roundResult.hangingPoints === 0) {
                roundResult.winners.totalPoints += game.hangingPoints;
                game.hangingPoints = 0;
            } else {
                game.hangingPoints += roundResult.hangingPoints;
            }

            if(roundResult.isValat){
                game.lastRoundWasValat = true;
            }else{
                game.lastRoundWasValat = false;
            }
            setTimeout(() => {
                io.to(game.room.roomID).emit('end_round', game);
            }, 3000);
        }
    }
}

const calculatePoints = (game) => {
    var bidTeam = null;
    var otherTeam = null;
    var declarationPoints = 0;
    var roundResult = {
        winners: null,
        hangingPoints: 0,
        isValat: false
    };
    var hangingPoints = 0;

    if (game.team1.player1.socketID === game.roundBidder.socketID || game.team1.player2.socketID === game.roundBidder.socketID) {
        bidTeam = game.team1;
        otherTeam = game.team2;
    } else if (game.team2.player1.socketID === game.roundBidder.socketID || game.team2.player2.socketID === game.roundBidder.socketID) {
        bidTeam = game.team2;
        otherTeam = game.team1;
    }

    var totalRoundScore = bidTeam.roundPoints + otherTeam.roundPoints;

    if (game.roundBid === 'No Trumps') {
        bidTeam.roundPoints *= 2;
        otherTeam.roundPoints *= 2;
        totalRoundScore *= 2;
    }

    if (bidTeam.roundPoints > totalRoundScore / 2) {
        if (bidTeam.roundPoints !== totalRoundScore) {
            if (game.roundMultiplier !== 1) {
                switch (game.roundBid) {
                    case "No Trumps":
                        bidTeam.totalPoints += 26 * game.roundMultiplier;
                        roundResult = {
                            winners: bidTeam,
                            hangingPoints: hangingPoints,
                            isValat: false
                        }
                        return roundResult;
                    case "All Trumps":
                        bidTeam.totalPoints += 26 * game.roundMultiplier + declarationPoints;
                        roundResult = {
                            winners: bidTeam,
                            hangingPoints: hangingPoints,
                            isValat: false
                        }
                        return roundResult;
                    default:
                        bidTeam.totalPoints += 16 * game.roundMultiplier + declarationPoints;
                        roundResult = {
                            winners: bidTeam,
                            hangingPoints: hangingPoints,
                            isValat: false
                        }
                        return roundResult;
                }
            }
        } else {
            bidTeam.roundPoints += 90;
            roundResult.isValat = true;
        }

        bidTeamHardPoints = Math.floor(bidTeam.roundPoints / 10);
        bidTeamLastDigit = bidTeam.roundPoints % 10;

        otherTeamHardPoints = Math.floor(otherTeam.roundPoints / 10);
        otherTeamLastDigit = otherTeam.roundPoints % 10;

        let roundingIndex = 0;
        switch (game.roundBid) {
            case "No Trumps":
                roundingIndex = 5;
                break;
            case "All Trumps":
                roundingIndex = 4;
                break;
            default:
                roundingIndex = 6;
                break;
        }

        var addedExtra = false;
        if (bidTeamLastDigit >= roundingIndex) {
            if (bidTeamLastDigit === otherTeamLastDigit) {
                if (bidTeamHardPoints < otherTeamHardPoints) {
                    bidTeamHardPoints++;
                } else {
                    otherTeamHardPoints++;
                }
                addedExtra = true;
            } else {
                bidTeamHardPoints++;
            }
        }
        if (otherTeamLastDigit >= roundingIndex && !addedExtra) {
            otherTeamHardPoints++;
        }

        bidTeam.totalPoints += bidTeamHardPoints;
        otherTeam.totalPoints += otherTeamHardPoints;

        roundResult.winners = bidTeam;
        roundResult.hangingPoints = hangingPoints;

    } else if (bidTeam.roundPoints < totalRoundScore / 2) {
        if (bidTeam.roundPoints !== 0) {
            if (game.roundMultiplier !== 1) {
                switch (game.roundBid) {
                    case "No Trumps":
                        otherTeam.totalPoints += 26 * game.roundMultiplier;
                        roundResult = {
                            winners: otherTeam,
                            hangingPoints: hangingPoints,
                            isValat: false
                        }
                        return roundResult;
                    case "All Trumps":
                        otherTeam.totalPoints += 26 * game.roundMultiplier + declarationPoints;
                        roundResult = {
                            winners: otherTeam,
                            hangingPoints: hangingPoints,
                            isValat: false
                        }
                        return roundResult;
                    default:
                        otherTeam.totalPoints += 16 * game.roundMultiplier + declarationPoints;
                        roundResult = {
                            winners: winners,
                            hangingPoints: hangingPoints,
                            isValat: false
                        }
                        return roundResult;
                }
            }
        } else {
            totalRoundScore += 90;
            roundResult.isValat = true;
        }
        switch (game.roundBid) {
            case "No Trumps":
                otherTeam.totalPoints += totalRoundScore / 10;
                break;
            case "All Trumps":
                otherTeam.totalPoints += Math.ceil(totalRoundScore / 10);
                break;
            default:
                otherTeam.totalPoints += Math.floor(totalRoundScore / 10);
                break;
        }

        roundResult.winners = otherTeam;
        roundResult.hangingPoints = hangingPoints;

    } else {
        if (game.roundMultiplier !== 1) {
            switch (game.roundBid) {
                case "No Trumps":
                    otherTeam.totalPoints += 13 * game.roundMultiplier;
                    hangingPoints += 13 * game.roundMultiplier;
                    roundResult = {
                        winners: null,
                        hangingPoints: hangingPoints,
                        isValat: false
                    }
                    return roundResult;
                case "All Trumps":
                    otherTeam.totalPoints += 13 * game.roundMultiplier + (declarationPoints / 2);
                    hangingPoints += 13 * game.roundMultiplier + (declarationPoints / 2);
                    roundResult = {
                        winners: null,
                        hangingPoints: hangingPoints,
                        isValat: false
                    }
                    return roundResult;
                default:
                    otherTeam.totalPoints += 8 * game.roundMultiplier + (declarationPoints / 2);
                    hangingPoints += 8 * game.roundMultiplier + (declarationPoints / 2);
                    roundResult = {
                        winners: null,
                        hangingPoints: hangingPoints,
                        isValat: false
                    }
                    return roundResult;
            }
        }

        switch (game.roundBid) {
            case "No Trumps":
                otherTeam.totalPoints += totalRoundScore / 20;
                hangingPoints = totalRoundScore / 20;
                break;
            case "All Trumps":
                otherTeam.totalPoints += Math.ceil(totalRoundScore / 20);
                hangingPoints = Math.ceil(totalRoundScore / 20);
                break;
            default:
                otherTeam.totalPoints += Math.floor(totalRoundScore / 20);
                hangingPoints += Math.floor(totalRoundScore / 20);
                if (otherTeam.roundPoints % 10 === 6) {
                    otherTeam.totalPoints++;
                    hangingPoints++;
                }
                break;
        }
        roundResult = {
            winners: null,
            hangingPoints: hangingPoints,
            isValat: false
        }
    }

    bidTeam.roundPoints = 0;
    otherTeam.roundPoints = 0;
    return roundResult;
}

const setTrickTurns = (game, currentTaker) => {

    const firstPlayer = game.room.players.find(player => player.socketID === currentTaker.socketID);
    const playerIndex = game.room.players.indexOf(firstPlayer);
    const secondPlayer = game.room.players[(playerIndex + 1) % 4];
    const thirdPlayer = game.room.players[(playerIndex + 2) % 4];
    const fourthPlayer = game.room.players[(playerIndex + 3) % 4];

    firstPlayer.trickTurn = 0;
    secondPlayer.trickTurn = 1;
    thirdPlayer.trickTurn = 2;
    fourthPlayer.trickTurn = 3;
}

module.exports = {
    cardLibrary,
    getBiddingResult,
    startPlayingRound,
}; // Export the cardLibrary object
