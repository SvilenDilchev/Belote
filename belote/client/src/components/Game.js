import { Component } from 'react';
import Scoreboard from './Scoreboard';
import {SouthPlayerDeck, OtherPlayerDeck} from './PlayerDecks';
import '../css/Game.css';

class Game extends Component {

    constructor(props) {
        super(props);
        this.state = {
            usScore: 10, // Initial value of usScore
            themScore: 20 // Initial value of themScore
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
                        tr
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
                        bl
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