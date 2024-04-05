import React, { Component } from 'react';
import Scoreboard from './Scoreboard';
import { SouthPlayerDeck, OtherPlayerDeck } from './PlayerDecks';
import { SingleNameField } from './NameFields';
import BidBox from './BidBox';
import ResultBox from './ResultBox';
import '../css/Game.css';
import { socket } from '../context/socket';
import PlayArea from './PlayArea';
import DeclareBox from './DeclareBox';
import MessageBubble from './MessageBubble';

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
            roundBiddingInfo: { biddingPlayer: null, gameBid: "Pass", multiplier: 1 },
            tempBid: null,
            tempBidder: null,
            declareBoxActive: false,
            cardsPlayed: cardsPlayed,
            gameEnded: false,
            messageInfo:{
                meMessage: null,
                partnerMessage: null,
                opponentRMessage: null,
                opponentLMessage: null,
            }
        };
    }

    componentDidMount() {
        this.startGame();
        socket.on('deal_first_cards', this.handleDealFirstCards);
        socket.on('request_bid', this.handleRequestBid);
        socket.on('bidding_result', this.handleBiddingResult);
        socket.on('deal_second_cards', this.handleDealSecondCards);
        socket.on('display_card', this.handleCardPlayed);
        socket.on('ask_for_card', this.handleAskForCard);
        socket.on('reset_trick', this.handleResetTrick);
        socket.on('update_temp_bid', this.handleTempBid);
        socket.on('end_round', this.handleEndRound);
        socket.on('display_winner', this.handleEndGame);
        socket.on('ask_for_declarations', this.handleAskForDeclarations);
        socket.on('display_message', this.handleDisplayMessage);
    }

    componentWillUnmount() {
        socket.off('deal_first_cards');
        socket.off('request_bid');
        socket.off('bidding_result');
        socket.off('deal_second_cards');
        socket.off('display_card');
        socket.off('ask_for_card');
        socket.off('reset_trick');
        socket.off('update_temp_bid');
        socket.off('end_round');
        socket.off('display_winner');
        socket.off('ask_for_declarations');
        socket.off('display_message');
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
        socket.emit('deal_3_cards', this.state);
    }

    requestBids() {
        if (this.state.me.turn === 0) {
            setTimeout(() => {
                socket.emit('request_bids', this.state.game);
            }, 2000);
        }
    }

    requestBid() {
        this.setState({ bidBoxActive: true });
    }

    sendBid(bid) {
        socket.emit('send_bid', bid);
        this.setState({
            bidBoxActive: false,
        });
    }

    handleDealFirstCards = (game) => {
        this.handleNewState(game);
        setTimeout(() => this.requestBids(), 3000);
    }

    handleRequestBid = (player, validBids) => {
        this.setState({ validBids });
        if (this.state.me.turn === player.turn) {
            this.requestBid(player);
        }
    }

    handleTempBid = (info) => {
        if (info.bid !== 'Pass') {
            if (info.bid === "Double") {
                const newTempBid = this.state.tempBid + " x2";
                this.setState(prevState => ({
                    ...prevState,
                    tempBid: newTempBid,
                    tempBidder: info.player,
                }));
            }
            else if (info.bid === "Redouble") {
                const newTempBid = this.state.tempBid.slice(0, -3) + " x4";
                this.setState(prevState => ({
                    ...prevState,
                    tempBid: newTempBid,
                    tempBidder: info.player,
                }));
            }
            else {
                this.setState({
                    tempBid: info.bid,
                    tempBidder: info.player
                });
            }
        }
    }

    handleBiddingResult = (roundBiddingInfo) => {
        var newRoundBiddingInfo = {
            ...roundBiddingInfo,
        }
        if (roundBiddingInfo.multiplier !== 1) {
            newRoundBiddingInfo = {
                ...roundBiddingInfo,
                gameBid: roundBiddingInfo.gameBid + ` x${roundBiddingInfo.multiplier}`
            }
        }
        this.setState(prevState => ({
            roundBiddingInfo: {
                ...prevState.roundBiddingInfo,
                ...newRoundBiddingInfo
            },
            tempBid: null,
            tempBidder: null
        }), () => {
            if (this.state.roundBiddingInfo.gameBid !== 'Pass') {
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
            if (this.state.me.turn === 3) {
                socket.emit('play_round', this.state);
            }
        }, 3000);
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

        this.setState(newState, function () {

        });
    }

    handleAskForCard = (player) => {
        if (this.state.me.socketID === player.socketID) {
            this.setState({
                game: {
                    ...this.state.game,
                    me: player
                },
                me: player
            });
        }
    }

    handleAskForDeclarations = (player) => {
        if (this.state.me.socketID === player.socketID) {
            this.setState({
                ...this.state,
                me: player,
                declareBoxActive: true,
            });
        }
    }

    sendDeclarations = () => {
        const selectedDeclarations = document.querySelectorAll('.DeclareBoxRow.selected');
        const declarations = [];
        selectedDeclarations.forEach((declaration) => {
            const declarationData = declaration.getAttribute('data-declaration');
            declarations.push(declarationData);
        });

        socket.emit('send_declarations', declarations);
        
        this.setState({
            ...this.state,
            declareBoxActive: false,
        });
    }

    handleDisplayMessage = (messageInfo) => {
        if (messageInfo.player.socketID === this.state.me.socketID) {
            this.setState((prevState) => ({
                messageInfo: {
                    ...prevState.messageInfo,
                    meMessage: messageInfo.message
                }
            }), () => {
                setTimeout(() => {
                    this.setState((prevState) => ({
                        messageInfo: {
                            ...prevState.messageInfo,
                            meMessage: null
                        }
                    }));
                }, 3000);
            });
        }
        if (messageInfo.player.socketID === this.state.partner.socketID) {
            this.setState((prevState) => ({
                messageInfo: {
                    ...prevState.messageInfo,
                    partnerMessage: messageInfo.message
                }
            }), () => {
                setTimeout(() => {
                    this.setState((prevState) => ({
                        messageInfo: {
                            ...prevState.messageInfo,
                            partnerMessage: null
                        }
                    }));
                }, 3000);
            });
        }
        if (messageInfo.player.socketID === this.state.opponentR.socketID) {
            this.setState((prevState) => ({
                messageInfo: {
                    ...prevState.messageInfo,
                    opponentRMessage: messageInfo.message
                }
            }), () => {
                setTimeout(() => {
                    this.setState((prevState) => ({
                        messageInfo: {
                            ...prevState.messageInfo,
                            opponentRMessage: null
                        }
                    }));
                }, 3000);
            });
        }
        if (messageInfo.player.socketID === this.state.opponentL.socketID) {
            this.setState((prevState) => ({
                messageInfo: {
                    ...prevState.messageInfo,
                    opponentLMessage: messageInfo.message
                }
            }), () => {
                setTimeout(() => {
                    this.setState((prevState) => ({
                        messageInfo: {
                            ...prevState.messageInfo,
                            opponentLMessage: null
                        }
                    }));
                }, 3000);
            });
        }
    }
    

    playCard(card) {
        socket.emit(`t${this.state.me.trickTurn}_play_card`, card, this.state.me);
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

    handleResetTrick = () => {
        this.setState({
            ...this.state,
            cardsPlayed: {
                me: {
                    player: this.state.me,
                    cardPlayed: false,
                    card: null,
                },
                opponentR: {
                    player: this.state.opponentR,
                    cardPlayed: false,
                    card: null,
                },
                opponentL: {
                    player: this.state.opponentL,
                    cardPlayed: false,
                    card: null,
                },
                partner: {
                    player: this.state.partner,
                    cardPlayed: false,
                    card: null,
                }
            }
        });
    }

    handleEndRound = (game) => {
        const { socket } = this.props;
        const { team1, team2 } = game;
        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, team1, team2);
        this.setState({
            ...this.state,
            game: game,
            us,
            them,
            me,
            partner,
            opponentR,
            opponentL,
            cardsPlayed: {
                me: {
                    player: this.state.me,
                    cardPlayed: false,
                    card: null,
                },
                opponentR: {
                    player: this.state.opponentR,
                    cardPlayed: false,
                    card: null,
                },
                opponentL: {
                    player: this.state.opponentL,
                    cardPlayed: false,
                    card: null,
                },
                partner: {
                    player: this.state.partner,
                    cardPlayed: false,
                    card: null,
                }
            },
        }, () => {
            if ((this.state.us.totalPoints >= 151 || this.state.them.totalPoints >= 151) && !this.state.game.lastRoundWasValat && this.state.us.totalPoints !== this.state.them.totalPoints) {
                if (this.state.me.turn === 3) {
                    socket.emit('end_game', this.state.game);
                }
            } else {
                this.endRound();
            }
        });
    }

    handleEndGame = (game) => {
        const { socket } = this.props;
        const { team1, team2 } = game;
        const { us, them } = this.getTeams(socket, team1, team2);
        const { me, partner, opponentR, opponentL } = this.getPlayers(socket, team1, team2);
        this.setState({
            ...this.state,
            game: game,
            us,
            them,
            me,
            partner,
            opponentR,
            opponentL,
            cardsPlayed: {
                me: {
                    player: this.state.me,
                    cardPlayed: false,
                    card: null,
                },
                opponentR: {
                    player: this.state.opponentR,
                    cardPlayed: false,
                    card: null,
                },
                opponentL: {
                    player: this.state.opponentL,
                    cardPlayed: false,
                    card: null,
                },
                partner: {
                    player: this.state.partner,
                    cardPlayed: false,
                    card: null,
                }
            },
            gameEnded: true,
        }, () => {
            setTimeout(() => {
                socket.emit('end_room', this.state.game);
            }, 10000);
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
            roundBiddingInfo: { biddingPlayer: null, gameBid: "Pass", multiplier: 1 }
        };

        this.setState(newState, () => {
            setTimeout(() => {
                this.playRound();
            }, 2000);
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
                        <Scoreboard usScore={us.totalPoints} themScore={them.totalPoints} gameBid={this.state.roundBiddingInfo.gameBid} bidder={this.state.roundBiddingInfo.biddingPlayer} tempBid={this.state.tempBid} tempBidder={this.state.tempBidder} />
                    </div>
                    <div className='Col MidCol' id='tmCell'>
                        <OtherPlayerDeck position={"North"} deck={partner.hand} />
                        <SingleNameField name={partner.name} position={"north"}/>
                        <MessageBubble message={this.state.messageInfo.partnerMessage}/>
                    </div>
                    <div className='Col RightCol' id='trCell'>
                    </div>
                </div>
                <div className='Row' id='MidRow'>
                    <div className='Col LeftCol' id='mlCell'>
                        <OtherPlayerDeck position={"West"} deck={opponentL.hand} />
                        <MessageBubble message={this.state.messageInfo.opponentLMessage}/>
                        <SingleNameField name={opponentL.name} position={"west"}/>
                    </div>
                    <div className='Col MidCol' id='mmCell'>
                        <PlayArea cardsPlayed={this.state.cardsPlayed} />
                    </div>
                    <div className='Col RightCol' id='mrCell'>
                        <MessageBubble message={this.state.messageInfo.opponentRMessage}/>
                        <OtherPlayerDeck position={"East"} deck={opponentR.hand} />
                        <SingleNameField name={opponentR.name} position={"east"}/>
                    </div>
                </div>
                <div className='Row' id='BotRow'>
                    <div className='Col LeftCol' id='blCell'>
                    </div>
                    <div className='Col MidCol' id='bmCell'>
                        <SouthPlayerDeck deck={me.hand} playCard={(card, index) => this.playCard(card, index)} />
                        <SingleNameField name={me.name} position={"south"}/>
                    </div>
                    <div className='Col RightCol' id='brCell'>
                        <BidBox
                            isActive={this.state.bidBoxActive}
                            validBids={this.state.validBids}
                            sendBid={(bid) => this.sendBid(bid)}
                            tempBidder={this.state.tempBidder}
                            partner={this.state.partner}
                        />
                        <ResultBox gameEnded={this.state.gameEnded} winner1={(this.state.us.totalPoints > this.state.them.totalPoints) ? me.name : opponentR.name} winner2={(this.state.us.totalPoints > this.state.them.totalPoints) ? partner.name : opponentL.name} />
                        <DeclareBox sendDeclarations={this.sendDeclarations} isActive={this.state.declareBoxActive} declarations={this.state.me.declarations}></DeclareBox>
                        <div className={`Overlay ${this.state.bidBoxActive || this.state.gameEnded || this.state.declareBoxActive ? "active" : ""}`} id="overlay"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;
