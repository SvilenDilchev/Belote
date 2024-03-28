import { Component } from 'react';
import '../css/Game.css';

class Game extends Component {

    render() {
        return (
            <div className='Game' id='game'>
                <div className='Row' id='TitleRow'>
                    <div className='PageTitle'> BELOTE </div>
                </div>
                <div className='Row' id='TopRow'>
                    <div className='Col' id='LeftCol'>
                        tl
                    </div>
                    <div className='Col' id='MidCol'>
                        tm
                    </div>
                    <div className='Col' id='RightCol'>
                        tr
                    </div>
                </div>
                <div className='Row' id='MidRow'>
                    <div className='Col' id='LeftCol'>
                        ml
                    </div>
                    <div className='Col' id='MidCol'>
                        mm
                    </div>
                    <div className='Col' id='RightCol'>
                        mr
                    </div>
                </div>
                <div className='Row' id='BotRow'>
                    <div className='Col' id='LeftCol'>
                        bl
                    </div>
                    <div className='Col' id='MidCol'>
                        bm
                    </div>
                    <div className='Col' id='RightCol'>
                        br
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;