import { Component } from 'react';

class DeclareBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isActive: props.isActive,
            declarations: props.declarations,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.declarations !== this.props.declarations || prevProps.isActive !== this.props.isActive) {
            this.setState({
                declarations: this.props.declarations,
                isActive: this.props.isActive
            });
        }
    }

    selectDeclaration = (e) => {
        const isSelected = e.target.classList.contains('selected');
        const selectedDeclarations = document.querySelectorAll('.DeclareBoxRow.selected');

        if (isSelected) {
            e.target.classList.remove('selected');
            return;
        }
        selectedDeclarations.forEach((declaration) => {
            declaration.classList.remove('selected');
        });
        e.target.classList.add('selected');
    }

    autoSelectBestDeclarations = () => {
        const declarations = document.querySelectorAll('.DeclareBoxRow');
        declarations.forEach((declaration) => {
            if (declaration.textContent.includes('20')) {
                declaration.classList.add('selected');
            }
        });
    }

    declarationMap = () => {
        return this.state.declarations.map((declaration, index) => {
            const declarations = declaration.split(' ').filter(el => el !== '');
            var decString = "";

            declarations.forEach((dec) => {
                if (dec.includes("Kare")) {
                    decString += "Kare";
                }
                else if (dec.includes('SF')) {
                    switch (dec.charAt(2)) {
                        case '3':
                            decString += "Терца";
                            break;
                        case '4':
                            decString += "50";
                            break;
                        case '5':
                            decString += "100";
                            break;
                        default:
                            break;
                    }
                }
                decString += " ";
            });

            return (
                <div className={`DeclareBoxRow ${index === 0 ? "selected" : ""}`} key={index} onClick={this.selectDeclaration} data-declaration={declaration}>
                    {decString}
                </div>
            )
        });
    }

    render() {
        return (
            <div>
                <div className={`DeclareBox ${this.state.isActive ? "active" : ""}`}>
                    <div className='DeclareBoxHeader'>Declare</div>
                    <hr className='DeclareBoxHR'></hr>
                    {this.declarationMap()}
                    <div className='DeclareButton' onClick={this.props.sendDeclarations}>
                        Declare
                    </div>
                </div>
            </div>
        );
    }
}

export default DeclareBox;