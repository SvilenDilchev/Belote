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
        const { team1, team2, roundNumber } = game;

        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, game);

        this.state = {
            game: game,
            roundNumber: roundNumber,
            us: us,
            them: them,
            me: me,
            partner: partner,
            opponentR: opponentR,
            opponentL: opponentL,

            bidBoxActive: false,
            validBids: ["Clubs", "Diamonds", "Hearts", "Spades", "No Trumps", "All Trumps", "Pass"],
            roundRoundBiddingInfo: {
                biddingPlayer: null,
                gameBid: "Pass",
                multiplier: 1
            }
        };
    }

    componentDidMount() {
        this.startGame();

        // Set up event listener for 'deal_first_cards' event
        socket.on('deal_first_cards', (game) => {
            this.handleNewState(game);
            setTimeout(() => {
                this.requestBids();
            }, 5000);
        });

        socket.on('request_bid', (player, validBids) => {
            this.setState({ validBids: validBids });
            if (this.state.me.turn === player.turn) {
                this.requestBid(player);
            }
        });

        socket.on('bidding_result', (roundRoundBiddingInfo) => {
            const newRoundRoundBiddingInfo = {
                gameBid: roundRoundBiddingInfo.gameBid,
                biddingPlayer: roundRoundBiddingInfo.biddingPlayer,
                multiplier: roundRoundBiddingInfo.multiplier
            };


            this.setState(prevState => ({
                roundRoundBiddingInfo: {
                    ...prevState.roundRoundBiddingInfo,
                    gameBid: roundRoundBiddingInfo.gameBid,
                    biddingPlayer: roundRoundBiddingInfo.biddingPlayer,
                    multiplier: roundRoundBiddingInfo.multiplier
                }
            }), () => {
                if (this.state.roundRoundBiddingInfo.gameBid !== 'Pass') {
                    if (this.state.me.turn === 3) {
                        this.deal3Cards();
                    }
                } else {
                    this.endRound();
                }
            });
        });

        socket.on('deal_second_cards', (game) => {
            this.handleNewState(game);
            setTimeout(() => {
                // TODO: Add actual play functionaliy here
            }, 5000);
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.game.roundNumber !== this.props.game.roundNumber) {

            this.setNewRound(this.props.game);
        }
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
        this.playRound();
    }

    playRound() {

        if (this.state.me.turn === 3) {
            this.deal5Cards();
        }
    }

    deal5Cards() {
        socket.emit('deal_5_cards', this.state.game);
    }

    deal3Cards() {
        socket.emit('deal_3_cards', this.state.game);
    }

    requestBids() {
        if (this.state.me.turn === 0) {
            socket.emit('request_bids', this.state.game);
        }
    }

    requestBid(player) {
        // Display bid box for player
        this.setState({ bidBoxActive: true });
    }

    sendBid(bid) {
        // Send bid to server
        socket.emit('send_bid', bid);
        this.setState({ bidBoxActive: false });
    }

    handleNewState(game) {
        const { socket } = this.props;
        const { team1, team2 } = game;
        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, game);

        this.setState({
            game: game,
            roundNumber: game.roundNumber,
            us: us,
            them: them,
            me: me,
            partner: partner,
            opponentR: opponentR,
            opponentL: opponentL
        });
    }

    endRound() {
        if (this.state.me.turn === 3) {
            socket.emit('end_round', this.state.game);
        }
    }

    setNewRound(newGame) {
        const { team1, team2 } = newGame;

        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, newGame);

        const newState = {
            game: newGame,
            roundNumber: newGame.roundNumber,
            us: us,
            them: them,
            me: me,
            partner: partner,
            opponentR: opponentR,
            opponentL: opponentL,

            bidBoxActive: false,
            validBids: ["Clubs", "Diamonds", "Hearts", "Spades", "No Trumps", "All Trumps", "Pass"],
            roundRoundBiddingInfo: {
                biddingPlayer: null,
                gameBid: "Pass",
                multiplier: 1
            }
        };

        this.setState(newState, () => {
            this.playRound();
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
                            sendBid={(bid) => this.sendBid(bid)} // Pass the sendBid function
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;
