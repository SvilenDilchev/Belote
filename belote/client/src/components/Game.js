import { Component } from 'react';
import Scoreboard from './Scoreboard';
import {SouthPlayerDeck, OtherPlayerDeck} from './PlayerDecks';
import {TopNameField, BottomNameField} from './NameFields';
import '../css/Game.css';


class Game extends Component {

    constructor(props) {
        super(props);

        const socket = props.socket;
        const game = props.game;
        var us, them;
        if(game.team1.player1.socketID === socket.id || game.team1.player2.socketID === socket.id){
            us = game.team1;
            them = game.team2;
        } else {
            us = game.team2;
            them = game.team1;
        }
        
        var me, partner, opponentR, opponentL;

        switch (socket.id) {
            case game.team1.player1.socketID:
                me = game.team1.player1;
                partner = game.team1.player2;
                opponentR = game.team2.player1;
                opponentL = game.team2.player2;
                break;
            case game.team1.player2.socketID:
                me = game.team1.player2;
                partner = game.team1.player1;
                opponentR = game.team2.player2;
                opponentL = game.team2.player1;
                break;
            case game.team2.player1.socketID:
                me = game.team2.player1;
                partner = game.team2.player2;
                opponentR = game.team1.player2;
                opponentL = game.team1.player1;
                break;
            case game.team2.player2.socketID:
                me = game.team2.player2;
                partner = game.team2.player1;
                opponentR = game.team1.player1;
                opponentL = game.team1.player2;
                break;
            default:
                break;
        }

        this.state = {
            usScore: us.totalPoints,
            themScore: them.totalPoints,
            me: me,
            partner: partner,
            opponentR: opponentR,
            opponentL: opponentL
        };
    }

    render() {
        return (
            <div className='Game' id='game'>
                <div className='Row' id='TitleRow'>
                    <div className='PageTitle'> BELOTE </div>
                </div>
                <div className='Row' id='TopRow'>
                    <div className='Col LeftCol' id='tlCell'>
                        <Scoreboard usScore={this.state.usScore} themScore={this.state.themScore} />
                    </div>
                    <div className='Col MidCol' id='tmCell'>
                        <OtherPlayerDeck position={"North"}/>
                    </div>
                    <div className='Col RightCol' id='trCell'>
                        <TopNameField leftName={this.state.partner.name} rightName={this.state.opponentR.name} />
                    </div>
                </div>
                <div className='Row' id='MidRow'>
                    <div className='Col LeftCol' id='mlCell'>
                        <OtherPlayerDeck position={"West"}/>

                    </div>
                    <div className='Col MidCol' id='mmCell'>
                        mm
                    </div>
                    <div className='Col RightCol' id='mrCell'>
                        <OtherPlayerDeck position={"East"}/>
                    </div>
                </div>
                <div className='Row' id='BotRow'>
                    <div className='Col LeftCol' id='blCell'>
                        <BottomNameField leftName={this.state.opponentL.name} rightName={this.state.me.name} />
                    </div>
                    <div className='Col MidCol' id='bmCell'>
                        <SouthPlayerDeck />
                    </div>
                    <div className='Col RightCol' id='brCell'>
                        br
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;