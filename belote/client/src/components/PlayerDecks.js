import { Component } from "react";

class SouthPlayerDeck extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cards: [1, 2, 3, 4, 5, 6, 7, 8]
        };
    }

    render() {
        return (
            <div className="DeckHold South">
                {
                    this.state.cards.map((card) => {
                        return <div className="MyCard" key={card} id={`myCard${card}`}>{card}</div>
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
            cards: [1, 2, 3, 4, 5, 6, 7, 8],
            position: props.position
        };
    }

    render() {
        return (
            <div className={`DeckHold ${this.state.position}`}>
                {this.state.cards.map((card) => {
                    return <div className="OpponentCard" key={card}>{card}</div>
                })}
            </div>
        );
    }
}

export default SouthPlayerDeck;
export { SouthPlayerDeck, OtherPlayerDeck };