import React, { Component } from 'react';

class Scoreboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usScore: props.usScore,
            themScore: props.themScore
        };
    }

    render() {
        return (
            <div className='Scoreboard' id='scoreboard'>
                <div className='ScoreboardRow'>
                    <div id='scoreboardTitle'>Score</div>
                </div>
                <hr></hr>
                <div className='ScoreboardRow'>
                    <div id='usScore'> Ние: {this.state.usScore}</div>
                </div>
                <div className='ScoreboardRow'>
                    <div id='themScore'> Вие: {this.state.themScore}</div>
                </div>
            </div>
        );
    }
}

export default Scoreboard;