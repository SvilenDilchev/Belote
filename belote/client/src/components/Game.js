import React, { Component } from 'react';
import Scoreboard from './Scoreboard';
import { SouthPlayerDeck, OtherPlayerDeck } from './PlayerDecks';
import { TopNameField, BottomNameField } from './NameFields';
import BidBox from './BidBox';
import '../css/Game.css';
import { socket } from '../context/socket';
import PlayArea from './PlayArea';

class Game extends Component {
    constructor(props) {
        super(props);

        const { socket, game: { team1, team2, roundNumber } } = props;
        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, team1, team2);

        const cardsPlayed = {
            me: { 
                player: me,
                cardPlayed: false,
                card: null,
            },
            opponentR: {
                player: opponentR,
                cardPlayed: false,
                card: null,
            },
            opponentL: {
                player: opponentL,
                cardPlayed: false,
                card: null,
            },
            partner: {
                player: partner,
                cardPlayed: false,
                card: null,
            }
        }

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
            roundRoundBiddingInfo: { biddingPlayer: null, gameBid: "Pass", multiplier: 1 },
            cardsPlayed: cardsPlayed
        };
    }

    componentDidMount() {
        this.startGame();
        socket.on('deal_first_cards', this.handleDealFirstCards);
        socket.on('request_bid', this.handleRequestBid);
        socket.on('bidding_result', this.handleBiddingResult);
        socket.on('deal_second_cards', this.handleDealSecondCards);
        socket.on('display_card', this.handleCardPlayed);
    }

    componentWillUnmount() {
        socket.off('deal_first_cards');
        socket.off('request_bid');
        socket.off('bidding_result');
        socket.off('deal_second_cards');
    }

    componentDidUpdate(prevState, prevProps) {
        if (prevProps.game.roundNumber !== this.props.game.roundNumber) {
            this.setNewRound(this.props.game);
        }
    }

    getTeams(socket, team1, team2) {
        return (team1.player1.socketID === socket.id || team1.player2.socketID === socket.id) ?
            { us: team1, them: team2 } : { us: team2, them: team1 };
    }

    getPlayers(socket, team1, team2) {
        var me, partner, opponentR, opponentL;
        if (team1.player1.socketID === socket.id) {
            me = team1.player1;
            partner = team1.player2;
            opponentR = team2.player1;
            opponentL = team2.player2;
        } else if (team1.player2.socketID === socket.id) {
            me = team1.player2;
            partner = team1.player1;
            opponentR = team2.player2;
            opponentL = team2.player1;
        } else if (team2.player1.socketID === socket.id) {
            me = team2.player1;
            partner = team2.player2;
            opponentR = team1.player2;
            opponentL = team1.player1;
        } else {
            me = team2.player2;
            partner = team2.player1;
            opponentR = team1.player1;
            opponentL = team1.player2;
        }

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

    handleCardPlayed = (data) => {
        const playerKey = data.player.turn;
        const updatedPlayerState = {
            player: data.player,
            cardPlayed: true,
            card: data.card
        };

        const updatedCardsPlayed = {
            ...this.state.cardsPlayed,
        };
    
        let newState = {
            cardsPlayed: updatedCardsPlayed
        };

        switch (playerKey) {
            case this.state.me.turn:
                newState.cardsPlayed.me = updatedPlayerState;
                newState = { ...newState, me: data.player };
                break;
            case this.state.partner.turn:
                newState.cardsPlayed.partner = updatedPlayerState;
                newState = { ...newState, partner: data.player };
                break;
            case this.state.opponentR.turn:
                newState.cardsPlayed.opponentR = updatedPlayerState;
                newState = { ...newState, opponentR: data.player };

                break;
            case this.state.opponentL.turn:
                newState.cardsPlayed.opponentL = updatedPlayerState;
                newState = { ...newState, opponentL: data.player };

                break;
            default:
                break;
        }
    
        this.setState(newState);
    }
    
    
    

    playCard(card, index){
        socket.emit('play_card', card, this.state.me);
        console.log(card);
        //TODO: emit play card
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
                        <Scoreboard usScore={us.totalPoints} themScore={them.totalPoints} gameBid={this.state.roundRoundBiddingInfo.gameBid}/>
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
                        <PlayArea cardsPlayed={this.state.cardsPlayed}/>
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
                        <SouthPlayerDeck deck={me.hand} playCard={(card, index) => this.playCard(card, index)} />
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
