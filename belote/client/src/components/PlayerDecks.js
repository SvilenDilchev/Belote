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
        if (!this.state.cards || this.state.cards.length === 0) {
            return null; // Render nothing if cards are empty
        }

        const totalCards = this.state.cards.length;
        const angleIncrement = 60 / (totalCards - 1); // Angle increment for arranging cards in a semi-circle
        let angle = -30; // Starting angle

        return (
            <div className="DeckHold South">
                {
                    this.state.cards.map((card, index) => {
                        if (!card) return null; // Handle null or undefined cards

                        const rotation = `${angle}deg`; // Calculate rotation angle for the card
                        const zIndex = totalCards - index; // Z-index based on card position

                        // Calculate vertical offset based on distance from the center of the deck
                        var verticalOffset = Math.abs(index - (totalCards - 1) / 2) * 24;
                        if(this.state.cards.length === 5 && (index === 1 || index === 3)){
                            switch(index){
                                case 1:
                                    verticalOffset -= 11;
                                    break;
                                case 3:
                                    verticalOffset -= 11;
                                    break;
                                default:
                                    break;
                            }
                        }else if(this.state.cards.length === 8){
                            if (index >= 1 && index <= 6) {
                                verticalOffset -= [14, 16, 7, 7, 16, 14][index - 1];
                            }
                        }

                        angle += angleIncrement; // Increment angle for the next card

                        return (
                            <div
                                key={card.key}
                                className="MyCard"
                                id={`myCard${card.key}`}
                                style={{
                                    zIndex,
                                    '--rotation': `${rotation}`,
                                    transform: `rotate(var(--rotation)) translateY(${verticalOffset}px)`,
                                     // Pass rotation as a custom property
                                }}
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
        if (!this.state.cards || this.state.cards.length === 0) {
            return null; // Render nothing if cards are empty
        }

        return (
            <div className={`DeckHold ${this.state.position}`}>
                {this.state.cards.map((card) => {
                    if (!card) return null; // Handle null or undefined cards
                    return <div className="OpponentCard" key={card.key}></div>;
                })}
            </div>
        );
    }
}

export default SouthPlayerDeck;
export { SouthPlayerDeck, OtherPlayerDeck };
