export default function Header({ activeRoom, userName }) {
  return (
    <header
      style={{
        height: "20%",
        background: "yellow",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h1>BlinkChat</h1>
      </div>
      <div>
        <p>Room: {activeRoom ? activeRoom : "no active room"}</p>
        <p>User: {userName}</p>
      </div>
    </header>
  );
}
