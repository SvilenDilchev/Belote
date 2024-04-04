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

        if (this.state.cards.length === 1) {
            angle = 0;
        }

        return (
            <div className="DeckHold South">
                {
                    this.state.cards.map((card, index) => {
                        if (!card) return null; // Handle null or undefined cards

                        var rotation = `${angle}deg`; // Calculate rotation angle for the card
                        const zIndex = totalCards - index + 10; // Z-index based on card position

                        // Calculate vertical offset based on distance from the center of the deck
                        var verticalOffset = Math.abs(index - (totalCards - 1) / 2) * 24;

                        switch (this.state.cards.length) {
                            case 2:
                                verticalOffset -= [10, 10][index];
                                break;
                            case 3:
                                verticalOffset -= [20, 0, 20][index];
                                break;
                            case 4:
                                verticalOffset -= [31, 11, 11, 31][index];
                                break;
                            case 5:
                                if (index === 1 || index === 3) {
                                    verticalOffset -= 22.5;
                                }
                                if(index === 0 || index === 4) {
                                    verticalOffset -= 42;
                                }
                                break;
                            case 6:
                                    verticalOffset -= [53, 33.5, 12, 12, 33.5, 53][index];
                                break;
                            case 7:
                                    verticalOffset -= [62, 43, 22.5, 0, 22.5, 43, 62][index];
                                break;
                            case 8:
                                    verticalOffset -= [73, 54, 34, 12, 12, 34, 54, 73][index];
                                break;
                            default:
                                break;
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
                                    transform: `rotate(var(--rotation)) translateY(${verticalOffset}vh)`,
                                    WebkitFilter: `brightness(${card.isPlayable ? 100 : 75}%)`,
                                    filter: `brightness(${card.isPlayable ? 100 : 75}%)`
                                    // Pass rotation as a custom property
                                }}
                                onClick={card.isPlayable ? () => this.props.playCard((card, index)) : undefined}
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
