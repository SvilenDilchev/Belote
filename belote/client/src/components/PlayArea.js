import React, { Component } from 'react';

function importAll(r) {
    let images = {};
    r.keys().map(item => {
        images[item.replace('./', '')] = r(item);
        return null;
    });
    return images;
}

const images = importAll(require.context('../assets/img/playing_cards/PNG-cards-1.3', false, /\.(png|jpe?g|svg)$/));

class PlayArea extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cardsPlayed: props.cardsPlayed
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.cardsPlayed !== prevProps.cardsPlayed) {
            this.setState({ cardsPlayed: this.props.cardsPlayed });
        }
    }

    render() {
        const { cardsPlayed } = this.state;

        // Define zIndex for each player
        const zIndexMap = {
            me: cardsPlayed.me.player.trickTurn + 2,
            opponentR: cardsPlayed.opponentR.player.trickTurn + 2,
            opponentL: cardsPlayed.opponentL.player.trickTurn + 2,
            partner: cardsPlayed.partner.player.trickTurn + 2
        };

        // Set zIndex based on player's turn


        return (
            <div className='PlayArea'>
                <div className='PlayRow'>
                    <div className='NorthCard' id='northCard' style={{ zIndex: zIndexMap['partner'], opacity: `${cardsPlayed.partner.card ? 1 : 0}`}}>
                        {cardsPlayed.partner.card ? <img src={images[`${cardsPlayed.partner.card.rank.toLowerCase()}_of_${cardsPlayed.partner.card.suit.toLowerCase()}.png`]} alt={cardsPlayed.partner.card} /> : null}
                    </div>
                </div>
                <div className='PlayRow'>
                    <div className='WestCard' id='westCard' style={{ zIndex: zIndexMap['opponentL'], opacity: `${cardsPlayed.opponentL.card ? 1 : 0}`}}>
                        {cardsPlayed.opponentL.card ? <img src={images[`${cardsPlayed.opponentL.card.rank.toLowerCase()}_of_${cardsPlayed.opponentL.card.suit.toLowerCase()}.png`]} alt={cardsPlayed.partner.card} /> : null}
                    </div>
                    <div className='EastCard' id='eastCard' style={{ zIndex: zIndexMap['opponentR'], opacity: `${cardsPlayed.opponentR.card ? 1 : 0}` }}>
                        {cardsPlayed.opponentR.card ? <img src={images[`${cardsPlayed.opponentR.card.rank.toLowerCase()}_of_${cardsPlayed.opponentR.card.suit.toLowerCase()}.png`]} alt={cardsPlayed.partner.card} /> : null}
                    </div>
                </div>
                <div className='PlayRow'>
                    <div className='SouthCard' id='southCard' style={{ zIndex: zIndexMap['me'], opacity: `${cardsPlayed.me.card ? 1 : 0}` }}>
                        {cardsPlayed.me.card ? <img src={images[`${cardsPlayed.me.card.rank.toLowerCase()}_of_${cardsPlayed.me.card.suit.toLowerCase()}.png`]} alt={cardsPlayed.partner.card} /> : null}
                    </div>
                </div>
            </div>
        );
    }
}

export default PlayArea;
