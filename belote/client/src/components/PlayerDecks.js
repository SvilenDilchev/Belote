import React, { Component } from "react";

function importAll(r) {
    let images = {};
    r.keys().map(item => {
        images[item.replace('./', '')] = r(item);
        return null;
    });
    return images;
}

const images = importAll(require.context('../assets/img/playing_cards/PNG-cards-1.3', false, /\.(png|jpe?g|svg)$/));

class SouthPlayerDeck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cards: props.deck
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.deck !== this.props.deck) {
            this.setState({
                cards: this.props.deck
            });
        }
    }

    render() {
        let zIndex = 10;
        return (
            <div className="DeckHold South">
                {
                    this.state.cards.map((card) => {
                        zIndex--;
                        return (
                            <div
                                key={card.key}
                                className="MyCard"
                                id={`myCard${card.key}`}
                                style={{ zIndex }}
                            >
                                <img src={images[`${card.rank.toLowerCase()}_of_${card.suit.toLowerCase()}.png`]} alt={`${card.rank} of ${card.suit}`} />
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

class OtherPlayerDeck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cards: props.deck,
            position: props.position
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.deck !== this.props.deck) {
            this.setState({
                cards: this.props.deck
            });
        }
    }

    render() {
        return (
            <div className={`DeckHold ${this.state.position}`}>
                {this.state.cards.map((card) => {
                    return <div className="OpponentCard" key={card.key}></div>;
                })}
            </div>
        );
    }
}

export default SouthPlayerDeck;
export { SouthPlayerDeck, OtherPlayerDeck };
