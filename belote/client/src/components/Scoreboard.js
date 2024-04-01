import React, { Component } from 'react';

class Scoreboard extends Component {
    constructor(props) {
        super(props);        
        this.state = {
            usScore: props.usScore,
            themScore: props.themScore,
            gameBid: props.gameBid
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.usScore !== this.props.usScore || prevProps.themScore !== this.props.themScore || prevProps.gameBid !== this.props.gameBid) {
            this.setState({
                usScore: this.props.usScore,
                themScore: this.props.themScore,
                gameBid: this.props.gameBid
            });
        }
    }

    render() {
        const hasBid = this.state.gameBid !== null && this.state.gameBid !== 'Pass';
        console.log('hasBid', hasBid)
        console.log('gameBid', this.state.gameBid)

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
                <hr style={
                    {
                        display: hasBid ? 'block' : 'none'
                    }
                }></hr>
                <div style={{
                    display: hasBid ? 'flex' : 'none',
                    flexDirection: 'column',
                    color: 'black',
                    fontSize: '20px',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    marginTop: '5px'
                }}>
                    {this.state.gameBid}
                </div>
            </div>
        );
    }
}

export default Scoreboard;