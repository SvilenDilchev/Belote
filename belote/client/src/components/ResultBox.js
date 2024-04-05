import { Component } from 'react';

class ResultBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            gameEnded: props.gameEnded,
            winner1: props.winner1,
            winner2: props.winner2
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.gameEnded !== this.props.gameEnded) {
            this.setState({
                gameEnded: this.props.gameEnded,
                winner1: this.props.winner1,
                winner2: this.props.winner2
            });
        }
    }

    render() {
        return (
            <div>
                <div className={`ResultBox ${this.state.gameEnded ? "active" : ""}`}>
                    <div className='ResultBoxHeader'>GAME OVER!</div>
                    <hr className='ResultBoxHR'></hr>
                    <div className='ResultRowBox'>
                        <div className='ResultBoxRow'>
                            {this.state.winner1}
                        </div>
                        <div className='ResultBoxRow'>
                            AND
                        </div>
                        <div className='ResultBoxRow'>
                            {this.state.winner2}
                        </div>
                        <div className='ResultBoxRow'>
                            HAVE WON THE GAME!
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ResultBox;