import '../css/PlayerList.css';

export default function PlayerList({ players }) {
    return (
        <ul>
            {players.map(({ socketID, name }) => (
                <li className="playerName" key={socketID}>{name}</li>
            ))}
        </ul>
    );
}
