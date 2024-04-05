import React, { Component } from 'react';


class MessageBubble extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.message !== this.props.message) {
            this.setState({
                message: this.props.message
            });
        }
    }

    messageMap = () => {
        return this.state.message.split(" ").map((msg, index) => {
            var msgString = '';
            if (msg.includes("Kare")) {
                msgString += "Kare";
            }
            else if (msg.includes('SF')) {
                switch (msg.charAt(2)) {
                    case '3':
                        msgString += "Терца";
                        break;
                    case '4':
                        msgString += "50";
                        break;
                    case '5':
                        msgString += "100";
                        break;
                    default:
                        break;
                }
            }else {
                msgString = msg;
            }

            return (
                <div key={index} className='MessageBubbleRow'>
                    {msgString}
                </div>
            );
        });
    }

    render() {

        const isActive = this.state.message ? true : false;

        return (
            <div className={`MessageBubble ${isActive ? "active" : ""}`}>
                {isActive ? this.messageMap() : ""}
            </div>
        );
    }
}

export default MessageBubble;