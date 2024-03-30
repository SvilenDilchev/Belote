import React, { Component } from 'react';
import Scoreboard from './Scoreboard';
import { SouthPlayerDeck, OtherPlayerDeck } from './PlayerDecks';
import { TopNameField, BottomNameField } from './NameFields';
import BidBox from './BidBox';
import '../css/Game.css';
import { socket } from '../context/socket';

class Game extends Component {
    constructor(props) {
        super(props);

        const { socket, game: { team1, team2, roundNumber } } = props;
        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, team1, team2);

        this.state = {
            game: props.game,
            roundNumber,
            us,
            them,
            me,
            partner,
            opponentR,
            opponentL,
            bidBoxActive: false,
            validBids: ["Clubs", "Diamonds", "Hearts", "Spades", "No Trumps", "All Trumps", "Pass"],
            roundRoundBiddingInfo: { biddingPlayer: null, gameBid: "Pass", multiplier: 1 }
        };
    }

    componentDidMount() {
        this.startGame();
        socket.on('deal_first_cards', this.handleDealFirstCards);
        socket.on('request_bid', this.handleRequestBid);
        socket.on('bidding_result', this.handleBiddingResult);
        socket.on('deal_second_cards', this.handleDealSecondCards);
    }

    componentWillUnmount() {
        socket.off('deal_first_cards');
        socket.off('request_bid');
        socket.off('bidding_result');
        socket.off('deal_second_cards');
    }

    componentDidUpdate(prevProps) {
        if (prevProps.game.roundNumber !== this.props.game.roundNumber) {
            this.setNewRound(this.props.game);
        }
    }

    getTeams(socket, team1, team2) {
        return (team1.player1.socketID === socket.id || team1.player2.socketID === socket.id) ?
            { us: team1, them: team2 } : { us: team2, them: team1 };
    }

    getPlayers(socket, team1, team2) {
        const { player1, player2 } = team1;
        const { player1: opp1, player2: opp2 } = team2;
        const players = [player1, player2, opp1, opp2];
        const index = players.findIndex(player => player.socketID === socket.id);
        const me = players[index];
        const partner = players[(index + 1) % 4];
        const opponentR = players[(index + 2) % 4];
        const opponentL = players[(index + 3) % 4];
        return { me, partner, opponentR, opponentL };
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
        this.setState({ bidBoxActive: true });
    }

    sendBid(bid) {
        socket.emit('send_bid', bid);
        this.setState({ bidBoxActive: false });
    }

    handleDealFirstCards = (game) => {
        this.handleNewState(game);
        setTimeout(() => this.requestBids(), 5000);
    }

    handleRequestBid = (player, validBids) => {
        this.setState({ validBids });
        if (this.state.me.turn === player.turn) {
            this.requestBid(player);
        }
    }

    handleBiddingResult = (roundRoundBiddingInfo) => {
        this.setState(prevState => ({
            roundRoundBiddingInfo: {
                ...prevState.roundRoundBiddingInfo,
                ...roundRoundBiddingInfo
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
    }

    handleDealSecondCards = (game) => {
        this.handleNewState(game);
        setTimeout(() => {
            // Add actual play functionality here
        }, 5000);
    }

    handleNewState(game) {
        const { socket } = this.props;
        const { team1, team2 } = game;
        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, team1, team2);

        this.setState({
            game,
            roundNumber: game.roundNumber,
            us,
            them,
            me,
            partner,
            opponentR,
            opponentL
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
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, team1, team2);

        const newState = {
            game: newGame,
            roundNumber: newGame.roundNumber,
            us,
            them,
            me,
            partner,
            opponentR,
            opponentL,
            bidBoxActive: false,
            validBids: ["Clubs", "Diamonds", "Hearts", "Spades", "No Trumps", "All Trumps", "Pass"],
            roundRoundBiddingInfo: { biddingPlayer: null, gameBid: "Pass", multiplier: 1 }
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
                            sendBid={(bid) => this.sendBid(bid)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;
