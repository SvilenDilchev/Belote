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
            const suitIndex1 = this.suits.indexOf(card1.suit);
            const suitIndex2 = this.suits.indexOf(card2.suit);
            return suitIndex1 - suitIndex2;
        });
    },

    sortDeckByBRSuits(deck) {
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
        for (const suit of this.brSuits) {
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
        for (const suit of this.brSuits) {
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

    sortDeckByTrumpSuit(deck, gameBid) {
        const sortedDeck = [];
        for (const suit of this.brSuits) {
            const suitCards = deck.filter(card => card.suit === suit);
            let sortedSuitCards;
            if (suit === gameBid) {
                sortedSuitCards = suitCards.sort((card1, card2) => {
                    const rankIndex1 = this.allTrumpRanks.indexOf(card1.rank);
                    const rankIndex2 = this.allTrumpRanks.indexOf(card2.rank);
                    return rankIndex2 - rankIndex1; // Sort in reverse order
                });
            } else {
                sortedSuitCards = suitCards.sort((card1, card2) => {
                    const rankIndex1 = this.noTrumpRanks.indexOf(card1.rank);
                    const rankIndex2 = this.noTrumpRanks.indexOf(card2.rank);
                    return rankIndex2 - rankIndex1; // Sort in reverse order
                });
            }
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
        });
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
            const messageInfo = {
                player: player,
                message: bid
            }
            io.to(gameData.room.roomID).emit('update_temp_bid', (tempBidInfo));
            io.to(gameData.room.roomID).emit('display_message', (messageInfo));
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
    for (const player of game.room.players) {
        detectDeclarations(player, game.roundBid);
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

        if (trickNumber === 0 && player.declarations.length > 0) {
            var messageData = {
                message: "",
                player: player
            };
            if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                    game.team1.roundDeclarations.push("Belote");
                } else {
                    game.team2.roundDeclarations.push("Belote");
                }
                messageData.message += "Belote ";
            }

            // TODO: Check for declarations
            io.to(player.socketID).emit('ask_for_declarations', player);

            socket.once('send_declarations', (declarations) => {
                if (declarations.length !== 0) {
                    if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                        game.team1.roundDeclarations.push(...declarations[0].split(' '));
                    } else {
                        game.team2.roundDeclarations.push(...declarations[0].split(' '));
                    }
                    for (const word of declarations[0].split(' ')) {
                        messageData.message += word + ' ';
                    }
                }

                player.hand.splice(card, 1);
                cardLibrary.resetCardsToUnplayable(player.hand);
                io.to(player.roomID).emit('display_message', (messageData));
                io.to(player.roomID).emit('display_card', (data));
                askP1(io, game, requestedSuit, winningCard);
            });
        } else {
            if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                var messageData = {
                    message: "Belote",
                    player: player
                };
                if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                    if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                        game.team1.roundDeclarations.push("Belote");
                    } else {
                        game.team2.roundDeclarations.push("Belote");
                    }
                }
                io.to(player.roomID).emit('display_message', (messageData));
            }
            player.hand.splice(card, 1);
            cardLibrary.resetCardsToUnplayable(player.hand);
            io.to(player.roomID).emit('display_card', (data));
            askP1(io, game, requestedSuit, winningCard);
        }
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

            //NEW
            if (trickNumber === 0 && player.declarations.length > 0) {
                var messageData = {
                    message: "",
                    player: player
                };
                if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                    if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                        game.team1.roundDeclarations.push("Belote");
                    } else {
                        game.team2.roundDeclarations.push("Belote");
                    }
                    messageData.message += "Belote ";
                }

                // TODO: Check for declarations
                io.to(player.socketID).emit('ask_for_declarations', player);

                socket.once('send_declarations', (declarations) => {
                    if (declarations.length !== 0) {
                        if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                            game.team1.roundDeclarations.push(...declarations[0].split(' '));
                        } else {
                            game.team2.roundDeclarations.push(...declarations[0].split(' '));
                        }
                        for (const word of declarations[0].split(' ')) {
                            messageData.message += word + ' ';
                        }
                    }

                    io.to(player.roomID).emit('display_message', (messageData));
                    io.to(player.roomID).emit('display_card', (data));
                    askP2(io, game, requestedSuit, winningCard);
                });
            } else {
                if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                    var messageData = {
                        message: "Belote",
                        player: player
                    };
                    if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                        if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                            game.team1.roundDeclarations.push("Belote");
                        } else {
                            game.team2.roundDeclarations.push("Belote");
                        }
                    }
                    io.to(player.roomID).emit('display_message', (messageData));
                }
                io.to(player.roomID).emit('display_card', (data));
                askP2(io, game, requestedSuit, winningCard);
            }
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

            if (trickNumber === 0 && player.declarations.length > 0) {
                var messageData = {
                    message: "",
                    player: player
                };
                if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                    if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                        game.team1.roundDeclarations.push("Belote");
                    } else {
                        game.team2.roundDeclarations.push("Belote");
                    }
                    messageData.message += "Belote ";
                }

                // TODO: Check for declarations
                io.to(player.socketID).emit('ask_for_declarations', player);

                socket.once('send_declarations', (declarations) => {
                    if (declarations.length !== 0) {
                        if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                            game.team1.roundDeclarations.push(...declarations[0].split(' '));
                        } else {
                            game.team2.roundDeclarations.push(...declarations[0].split(' '));
                        }
                        for (const word of declarations[0].split(' ')) {
                            messageData.message += word + ' ';
                        }
                    }

                    io.to(player.roomID).emit('display_message', (messageData));
                    io.to(player.roomID).emit('display_card', (data));
                    askP3(io, game, requestedSuit, winningCard);
                });
            } else {
                if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                    var messageData = {
                        message: "Belote",
                        player: player
                    };
                    if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                        if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                            game.team1.roundDeclarations.push("Belote");
                        } else {
                            game.team2.roundDeclarations.push("Belote");
                        }
                    }
                    io.to(player.roomID).emit('display_message', (messageData));
                }
                io.to(player.roomID).emit('display_card', (data));
                askP3(io, game, requestedSuit, winningCard);
            }
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

            if (trickNumber === 0 && player.declarations.length > 0) {
                var messageData = {
                    message: "",
                    player: player
                };
                if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                    if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                        game.team1.roundDeclarations.push("Belote");
                    } else {
                        game.team2.roundDeclarations.push("Belote");
                    }
                    messageData.message += "Belote ";
                }

                // TODO: Check for declarations
                io.to(player.socketID).emit('ask_for_declarations', player);

                socket.once('send_declarations', (declarations) => {
                    if (declarations.length !== 0) {
                        if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                            game.team1.roundDeclarations.push(...declarations[0].split(' '));
                        } else {
                            game.team2.roundDeclarations.push(...declarations[0].split(' '));
                        }
                        for (const word of declarations[0].split(' ')) {
                            messageData.message += word + ' ';
                        }
                    }

                    io.to(player.roomID).emit('display_message', (messageData));
                    io.to(player.roomID).emit('display_card', (data));
                    addPoints();
                });
            } else {
                if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                    var messageData = {
                        message: "Belote",
                        player: player
                    };
                    if (data.card.suit === requestedSuit && beloteCheck(data.card, player.hand)) {
                        if (game.team1.player1.socketID === player.socketID || game.team1.player2.socketID === player.socketID) {
                            game.team1.roundDeclarations.push("Belote");
                        } else {
                            game.team2.roundDeclarations.push("Belote");
                        }
                    }
                    io.to(player.roomID).emit('display_message', (messageData));
                }
                io.to(player.roomID).emit('display_card', (data));
                addPoints();
            }


        });
    }

    function addPoints() {
        const roundPoints = cardLibrary.countPoins(cardsPlayed);
        if (game.team1.player1.socketID === currentTaker.socketID || game.team1.player2.socketID === currentTaker.socketID) {
            game.team1.roundPoints += roundPoints;
            game.team1.hasTakenHand = true;
            console.log("t1 gets points: ", roundPoints)
        } else {
            game.team2.roundPoints += roundPoints;
            game.team2.hasTakenHand = true;
            console.log("t2 gets points: ", roundPoints)
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
                console.log("t1 last 10")
            } else {
                game.team2.roundPoints += 10;
                console.log("t2 last 10")
            }
            var roundResult = calculatePoints(game);
            console.log("roundResult: ", roundResult);

            if (roundResult.hangingPoints === 0) {
                roundResult.winners.totalPoints += game.hangingPoints;
                game.hangingPoints = 0;
            } else {
                game.hangingPoints += roundResult.hangingPoints;
            }

            if (roundResult.isValat) {
                game.lastRoundWasValat = true;
            } else {
                game.lastRoundWasValat = false;
            }

            game.team1.roundDeclarations = [];
            game.team2.roundDeclarations = [];
            game.team1.roundPoints = 0;
            game.team2.roundPoints = 0;
            game.team1.hasTakenHand = false;
            for (const player of game.room.players) {
                player.declarations = [];
            }

            console.log("ending game: ", game);
            setTimeout(() => {
                io.to(game.room.roomID).emit('end_round', game);
            }, 3000);
        }
    }
}

const calculatePoints = (game) => {
    var bidTeam = null;
    var otherTeam = null;
    var declarationPoints = (calculateDeclarationPoints(game) / 10);
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
        console.log("izkarana igra")
        if (otherTeam.hasTakenHand) {
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
            console.log("valat")
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
        console.log("vutre igra")
        if (bidTeam.hasTakenHand) {
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
            console.log("valat")
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

const beloteCheck = (card, hand) => {
    // Check if the card is a king or queen
    if ((card.rank === 'King' || card.rank === 'Queen') && card.isTrump) {
        // Find the other card (King or Queen) of the same suit
        const otherCard = hand.find(c => (c.rank === 'King' || c.rank === 'Queen') && c.rank !== card.rank && c.suit === card.suit);

        // If other card of same suit is found, return true
        if (otherCard) {
            return true;
        }
    }

    // Return false if the conditions are not met
    return false;
};

const detectDeclarations = (player, gameBid) => {
    if (gameBid === 'No Trumps') {
        return;
    }

    var kareCombination = "";
    const ranksCount = {};

    // Count the number of cards for each rank in the player's hand
    for (const card of player.hand) {
        // Exclude cards with ranks 7 or 8
        if (card.rank !== "7" && card.rank !== "8") {
            if (ranksCount[card.rank]) {
                ranksCount[card.rank]++;
            } else {
                ranksCount[card.rank] = 1;
            }
        }
    }

    // Check if there is a four of a kind
    for (const rank in ranksCount) {
        if (ranksCount[rank] === 4) {
            kareCombination += "Kare";
            kareCombination += rank;
            kareCombination += " ";
            break;
        }
    }

    if (kareCombination !== "") {
        const nonKareCards = player.hand.filter(card => ranksCount[card.rank] !== 4);
        let longestStraightFlushAfterKare = '';

        for (const suit of cardLibrary.suits) {
            const suitCards = nonKareCards.filter(card => card.suit === suit);
            if (suitCards.length < 3) continue;

            suitCards.sort((a, b) => cardLibrary.ranks.indexOf(a.rank) - cardLibrary.ranks.indexOf(b.rank));

            let currentLength = 1;
            let maxLength = 1;
            let currentSF = '';
            let highestRank = '';

            for (let i = 1; i < suitCards.length; i++) {
                const currentRankIndex = cardLibrary.ranks.indexOf(suitCards[i].rank);
                const prevRankIndex = cardLibrary.ranks.indexOf(suitCards[i - 1].rank);

                if (currentRankIndex === prevRankIndex + 1) {
                    currentLength++;
                    if (currentLength >= 3) {
                        if (currentLength > maxLength) {
                            maxLength = currentLength;
                            highestRank = suitCards[i].rank;
                            currentSF = `SF${maxLength}${highestRank}`;
                        }
                    }
                } else {
                    currentLength = 1;
                }
            }

            if (maxLength >= 3 && currentSF.length > longestStraightFlushAfterKare.length) {
                longestStraightFlushAfterKare = currentSF;
            }
        }

        kareCombination += longestStraightFlushAfterKare;
    }

    let sfCombination = "";

    for (const suit of cardLibrary.suits) {
        const suitCards = player.hand.filter(card => card.suit === suit);
        if (suitCards.length < 3) continue;

        suitCards.sort((a, b) => cardLibrary.ranks.indexOf(a.rank) - cardLibrary.ranks.indexOf(b.rank));

        let currentLength = 1;
        let maxLength = 1;
        let currentSF = '';
        let highestRank = '';

        for (let i = 1; i < suitCards.length; i++) {
            const currentRankIndex = cardLibrary.ranks.indexOf(suitCards[i].rank);
            const prevRankIndex = cardLibrary.ranks.indexOf(suitCards[i - 1].rank);

            if (currentRankIndex === prevRankIndex + 1) {
                currentLength++;
                if (currentLength >= 3) {
                    if (currentLength >= 5 && currentLength <= 7) {
                        maxLength = 5;
                    } else if (currentLength === 8) {
                        sfCombination += `SF5Ace SF3Nine`;
                        maxLength = 0;
                        break;
                    } else {
                        maxLength = currentLength;
                    }
                    highestRank = suitCards[i].rank;

                    currentSF = `SF${maxLength}${highestRank}`;

                    if (i === suitCards.length - 1) {
                        sfCombination += currentSF + " ";  
                    }
                }
            } else if (currentRankIndex !== prevRankIndex) {
                if (currentLength >= 3) {
                    sfCombination += currentSF + " ";
                }
                currentLength = 1;
            }
        }
    }


    if (kareCombination !== "") {
        player.declarations.push(kareCombination);
    }

    if (sfCombination !== "") {
        player.declarations.push(sfCombination);
    }
}

const calculateDeclarationPoints = (game) => {
    var totalPoints = 0;
    game.team1.roundDeclarations = game.team1.roundDeclarations.filter(declaration => declaration !== '');
    game.team2.roundDeclarations = game.team2.roundDeclarations.filter(declaration => declaration !== '');

    let teamWithLargestKare = null;
    let teamWithLargestSF = null;

    // Function to compare two cards based on their ranks
    const compareCards = (card1, card2) => {
        const rankIndex1 = cardLibrary.ranks.indexOf(card1);
        const rankIndex2 = cardLibrary.ranks.indexOf(card2);
        return rankIndex2 - rankIndex1;
    };

    // Function to find the larger Kare in a team's roundDeclarations array
    const findLargerKare = (declarations) => {
        let largerKare = null;
        for (const declaration of declarations) {
            if (declaration.includes('Kare')) {
                const kareRank = declaration.substr(4); // Extract rank from declaration string
                if (!largerKare || compareCards(kareRank, largerKare.substr(4)) > 0) {
                    largerKare = declaration;
                }
            }
        }
        return largerKare;
    };

    // Function to find the larger SF declaration in a team's roundDeclarations array
    const findLargerSF = (declarations) => {
        let largerSF = null;
        for (const declaration of declarations) {
            if (declaration.includes('SF')) {
                const sfLength = parseInt(declaration[2]); // Get length from declaration string
                const sfValue = declaration.substr(3); // Extract value from declaration string
                if (!largerSF ||
                    sfLength > parseInt(largerSF[2]) ||
                    (sfLength === parseInt(largerSF[2]) && compareCards(sfValue, largerSF.substr(3)) > 0)) {
                    largerSF = declaration;
                }
            }
        }
        return largerSF;
    };

    // Find larger Kare in both teams' declarations
    const team1LargerKare = findLargerKare(game.team1.roundDeclarations);
    const team2LargerKare = findLargerKare(game.team2.roundDeclarations);

    // Find larger SF declarations in both teams' declarations
    const team1LargerSF = findLargerSF(game.team1.roundDeclarations);
    const team2LargerSF = findLargerSF(game.team2.roundDeclarations);

    // Compare the larger Kares from both teams and update teamWithLargestKare accordingly
    if (team1LargerKare && !team2LargerKare) {
        teamWithLargestKare = game.team1;
        console.log("t1 s kare");
    } else if (team2LargerKare && !team1LargerKare) {
        teamWithLargestKare = game.team2;
        console.log("t2 s kare");
    } else if (team1LargerKare && team2LargerKare) {
        const comparisonResult = compareCards(team1LargerKare.substr(4), team2LargerKare.substr(4));
        if (comparisonResult > 0) {
            teamWithLargestKare = game.team1;
            console.log("t1 s kare");
        } else if (comparisonResult < 0) {
            teamWithLargestKare = game.team2;
            console.log("t2 s kare");
        }
    }

    // Compare the larger SF declarations from both teams and update teamWithLargestSF accordingly
    if (team1LargerSF && !team2LargerSF) {
        teamWithLargestSF = game.team1;
        console.log("t1 s sf")
    } else if (team2LargerSF && !team1LargerSF) {
        teamWithLargestSF = game.team2;
        console.log("t2 s sf")
    } else if (team1LargerSF && team2LargerSF) {
        const lengthComparison = parseInt(team1LargerSF[2]) - parseInt(team2LargerSF[2]);
        if (lengthComparison > 0 || (lengthComparison === 0 && compareCards(team1LargerSF.substr(3), team2LargerSF.substr(3)) > 0)) {
            teamWithLargestSF = game.team1;
            console.log("t1 s sf")
        } else if (lengthComparison < 0 || (lengthComparison === 0 && compareCards(team1LargerSF.substr(3), team2LargerSF.substr(3)) < 0)) {
            teamWithLargestSF = game.team2;
            console.log("t2 s sf")
        }
    }

    // If a team has the largest Kare, process its roundDeclarations and add points accordingly
    if (teamWithLargestKare) {
        for (const declaration of teamWithLargestKare.roundDeclarations) {
            if (declaration.includes('Kare')) {
                const kareRank = declaration.substr(4); // Extract rank from declaration string
                let declarationValue = 100; // Default value for all ranks other than Jack and 9
                if (kareRank === 'Jack') {
                    declarationValue = 200;
                } else if (kareRank === '9') {
                    declarationValue = 150;
                }
                teamWithLargestKare.roundPoints += declarationValue;
                totalPoints += declarationValue;
                console.log("dobavqne na kare tochki:", declarationValue);
            }
        }
    }

    // Process points for the team with the largest SF
    if (teamWithLargestSF) {
        for (const declaration of teamWithLargestSF.roundDeclarations) {
            if (declaration.includes('SF')) {
                const sfLength = parseInt(declaration[2]); // Get length from declaration string
                let declarationValue = 0;
                if (sfLength === 3) {
                    declarationValue = 20;
                    console.log("terca")
                } else if (sfLength === 4) {
                    declarationValue = 50;
                    console.log("50")
                } else if (sfLength === 5) {
                    declarationValue = 100;
                    console.log("100")
                }
                teamWithLargestSF.roundPoints += declarationValue;
                totalPoints += declarationValue;
            }
        }
    }

    // Process points for Belote declarations
    for (const team of [game.team1, game.team2]) {
        for (const declaration of team.roundDeclarations) {
            if (declaration === 'Belote') {
                team.roundPoints += 20;
                totalPoints += 20;
                console.log("belote");
            }
        }
    }

    return totalPoints;
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
