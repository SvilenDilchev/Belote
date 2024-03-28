import { Component } from 'react';
import Scoreboard from './Scoreboard';
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
                    <div className='Col LeftCol' id='tlCol'>
                        <Scoreboard usScore={this.state.usScore} themScore={this.state.themScore} />
                    </div>
                    <div className='Col MidCol' id='tmCol'>
                        tm
                    </div>
                    <div className='Col RightCol' id='trCol'>
                        tr
                    </div>
                </div>
                <div className='Row' id='MidRow'>
                    <div className='Col LeftCol' id='mlCol'>
                        ml
                    </div>
                    <div className='Col MidCol' id='mmCol'>
                        mm
                    </div>
                    <div className='Col RightCol' id='mrCol'>
                        mr
                    </div>
                </div>
                <div className='Row' id='BotRow'>
                    <div className='Col LeftCol' id='blCol'>
                        bl
                    </div>
                    <div className='Col MidCol' id='bmCol'>
                        bm
                    </div>
                    <div className='Col RightCol' id='brCol'>
                        br
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;