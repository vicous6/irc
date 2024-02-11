export default function RoomsList({ rooms }) {
  // soit une liste de :[username,salon]
  // soit une list d'objet message

  return (
    <div style={{ border: "5px solid blue", overflowY: "auto", height: "85%" }}>
      <div>Liste des salons</div>
      <ul>
        {rooms.length ? (
          rooms.map((elem) => <li key={elem.name}>{elem.name}</li>)
        ) : (
          <li>Pas de salon</li>
        )}
      </ul>
    </div>
  );
}
