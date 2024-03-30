import { Component } from 'react';
import Scoreboard from './Scoreboard';
import { SouthPlayerDeck, OtherPlayerDeck } from './PlayerDecks';
import { TopNameField, BottomNameField } from './NameFields';
import BidBox from './BidBox';
import '../css/Game.css';
import { socket } from '../context/socket';

class Game extends Component {
    constructor(props) {
        super(props);

        const { socket, game } = props;
        const { team1, team2 } = game;

        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, game);

        this.state = {
            game: game,
            us: us,
            them: them,
            me: me,
            partner: partner,
            opponentR: opponentR,
            opponentL: opponentL,

            bidBoxActive: false,
            validBids: ["Clubs", "Diamonds", "Hearts", "Spades", "No Trumps", "All Trumps", "Pass"],
        };
    }

    componentDidMount() {
        this.startGame();
        // Set up event listener for 'deal_first_cards' event
        socket.on('deal_first_cards', (game) => {
            console.log('First cards dealt');
            this.handleNewState(game);
            setTimeout(() => {
                this.requestBids();
            }, 5000);
        });
    }

    componentWillUnmount() {
        // Clean up event listener when component unmounts
        socket.off('deal_first_cards');
    }

    getTeams(socket, team1, team2) {
        return (team1.player1.socketID === socket.id || team1.player2.socketID === socket.id) ?
            { us: team1, them: team2 } :
            { us: team2, them: team1 };
    }

    getPlayers(socket, game) {
        const { team1, team2 } = game;
        const playerLookup = {
            [team1.player1.socketID]: { me: team1.player1, partner: team1.player2, opponentR: team2.player1, opponentL: team2.player2 },
            [team1.player2.socketID]: { me: team1.player2, partner: team1.player1, opponentR: team2.player2, opponentL: team2.player1 },
            [team2.player1.socketID]: { me: team2.player1, partner: team2.player2, opponentR: team1.player2, opponentL: team1.player1 },
            [team2.player2.socketID]: { me: team2.player2, partner: team2.player1, opponentR: team1.player1, opponentL: team1.player2 }
        };
        return playerLookup[socket.id];
    }

    startGame() {
        console.log('Game has started');
        this.playRound();
    }

    playRound() {
        console.log('Round has started');
        if (this.state.me.turn === 3) {
            this.deal5Cards();
        }
    }

    deal5Cards() {
        socket.emit('deal_5_cards', this.state.game);
    }

    requestBids() {
        console.log('Requesting bids');
        if (this.state.me.turn === 0) {
            this.requestBid(this.state.me);
        }
    }

    requestBid(player) {
        console.log('Requesting bid from', player.name);
        // Display bid box for player
        this.setState({ bidBoxActive: true });
    }

    sendBid(bid) {
        console.log('Sending bid', bid);
    }

    handleNewState(game) {
        const { socket } = this.props;
        const { team1, team2 } = game;
        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, game);

        this.setState({
            game: game,
            us: us,
            them: them,
            me: me,
            partner: partner,
            opponentR: opponentR,
            opponentL: opponentL
        });
    }

    render() {
        const { us, them, me, partner, opponentR, opponentL } = this.state;

        return (
            <div className='Game' id='game'>
                <div className='Row' id='TitleRow'>
                    <div className='PageTitle'> BELOTE </div>
                </div>
                <div className='Row' id='TopRow'>
                    <div className='Col LeftCol' id='tlCell'>
                        <Scoreboard usScore={us.totalPoints} themScore={them.totalPoints} />
                    </div>
                    <div className='Col MidCol' id='tmCell'>
                        <OtherPlayerDeck position={"North"} deck={partner.hand} />
                    </div>
                    <div className='Col RightCol' id='trCell'>
                        <TopNameField leftName={partner.name} rightName={opponentR.name} />
                    </div>
                </div>
                <div className='Row' id='MidRow'>
                    <div className='Col LeftCol' id='mlCell'>
                        <OtherPlayerDeck position={"West"} deck={opponentL.hand} />
                    </div>
                    <div className='Col MidCol' id='mmCell'>
                        mm
                    </div>
                    <div className='Col RightCol' id='mrCell'>
                        <OtherPlayerDeck position={"East"} deck={opponentR.hand} />
                    </div>
                </div>
                <div className='Row' id='BotRow'>
                    <div className='Col LeftCol' id='blCell'>
                        <BottomNameField leftName={opponentL.name} rightName={me.name} />
                    </div>
                    <div className='Col MidCol' id='bmCell'>
                        <SouthPlayerDeck deck={me.hand} />
                    </div>
                    <div className='Col RightCol' id='brCell'>
                        <BidBox
                            isActive={this.state.bidBoxActive}
                            validBids={this.state.validBids}
                            sendBid={this.sendBid} // Pass the sendBid function
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;
