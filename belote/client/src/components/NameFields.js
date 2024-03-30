
import { Component } from "react";

class TopNameField extends Component {

    constructor(props) {
        super(props);
        this.state = {
            leftName: props.leftName,
            rightName: props.rightName
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.leftName !== this.props.leftName || prevProps.rightName !== this.props.rightName) {
            this.setState({
                leftName: this.props.leftName,
                rightName: this.props.rightName
            });
        }
    }

    render() {
        return (
            <div className="NameBox">
                <div className="NameField" id="topLeftName"> {this.state.leftName} </div>
                <div className="NameField" id="topRightName"> {this.state.rightName} </div>
            </div>
        );
    }
}

class BottomNameField extends Component {

    constructor(props) {
        super(props);
        this.state = {
            leftName: props.leftName,
            rightName: props.rightName
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.leftName !== this.props.leftName || prevProps.rightName !== this.props.rightName) {
            this.setState({
                leftName: this.props.leftName,
                rightName: this.props.rightName
            });
        }
    }

    render() {
        return (
            <div className="NameBox">
                <div className="NameField" id="bottomLeftName"> {this.state.leftName} </div>
                <div className="NameField" id="bottomRightName"> {this.state.rightName} </div>
            </div>
        );
    }
}

export default TopNameField;
export { TopNameField, BottomNameField };