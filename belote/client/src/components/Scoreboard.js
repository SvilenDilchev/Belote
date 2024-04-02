import React, { Component } from 'react';

class Scoreboard extends Component {
    constructor(props) {
        super(props);        
        this.state = {
            usScore: props.usScore,
            themScore: props.themScore,
            gameBid: props.gameBid,
            tempBid: props.tempBid,
            bidder: props.bidder,
            tempBidder: props.tempBidder
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.usScore !== this.props.usScore || prevProps.themScore !== this.props.themScore || prevProps.gameBid !== this.props.gameBid || prevProps.bidder !== this.props.bidder || prevProps.tempBid !== this.props.tempBid || prevProps.tempBidder !== this.props.tempBidder) {
            this.setState({
                usScore: this.props.usScore,
                themScore: this.props.themScore,
                gameBid: this.props.gameBid,
                tempBid: this.props.tempBid,
                bidder: this.props.bidder,
                tempBidder: this.props.tempBidder
            }, () => {
                console.log("state gameBid: " + this.state.gameBid);
                console.log("state tempBid: " + this.state.tempBid);
                console.log("state bidder: " + this.state.bidder);
                console.log("state tempBidder: " + this.state.tempBidder);
            });
        }
    }

    render() {
        const hasBid = (this.state.gameBid !== null && this.state.gameBid !== 'Pass') || (this.state.tempBid !== null && this.state.tempBid !== 'Pass');
        const hasFullBid = this.state.gameBid !== null && this.state.gameBid !== 'Pass';

        console.log("hasbid: " + hasBid);
        console.log("hasFullBid: " + hasFullBid);

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
                    {hasFullBid ? this.state.bidder.name : hasBid ? this.state.tempBidder.name : ""}: {hasFullBid ? this.state.gameBid : hasBid ? this.state.tempBid : ""}
                </div>
            </div>
        );
    }
}

export default Scoreboard;