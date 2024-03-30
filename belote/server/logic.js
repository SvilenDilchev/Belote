const cardLibrary = {
    
    keyCounter: 0, // Initialize a key counter

    suits: ['Hearts', 'Diamonds', 'Clubs', 'Spades'],
    ranks: ['7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'],

    createCard: function(rank, suit, isTrump = false, isPlayable = true) {
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

module.exports = cardLibrary; // Export the cardLibrary object
