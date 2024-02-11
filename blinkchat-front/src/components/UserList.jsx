export default function UsersList({ users, activeRoom }) {
  return (
    <div style={{ border: "5px solid blue", overflowY: "auto", height: "85%" }}>
      <div>Liste des Users du salon {activeRoom}</div>
      <ul>
        {users.length ? (
          users.map((elem) => <li key={elem}>{elem}</li>)
        ) : (
          <li>Pas de salon</li>
        )}
      </ul>
    </div>
  );
}
