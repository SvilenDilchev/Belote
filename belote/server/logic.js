const cardLibrary = {

    keyCounter: 0, // Initialize a key counter

    suits: ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
    ranks: ['7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'],

    createCard: function (rank, suit, isTrump = false, isPlayable = true) {
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
};


const getBiddingResult = (gameData, io, passCount = 0, bidCount = 0, currentPlayerIndex = 0, gameBid = 'Pass', biddingPlayer = null, validBids = ['Clubs', 'Diamonds', 'Hearts', 'Spades', 'No Trumps', 'All Trumps'], multiplier = 1, bid = 'Pass', hasEmited = false) => {
    const processBidding = () => {
        const player = gameData.room.players.find(player => player.turn === currentPlayerIndex);
        const socket = io.sockets.sockets.get(player.socketID);
        io.to(player.socketID).emit('request_bid', player, validBids);

        socket.once('send_bid', (bid) => {
            bid = bid;

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
                if(!hasEmited){
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

module.exports = {
    cardLibrary,
    getBiddingResult
}; // Export the cardLibrary object
