export default function ConversationList({ messages, activeRoom }) {
  // console.log(messages);

  return (
    <>
      <h1>Liste des messages du salon : {activeRoom}</h1>
      <ul>
        {messages.length ? (
          messages.map((message) => (
            <li>
              <p>{message.text}</p>
              <b>{message.author}</b>
              <i>{message.date}</i>
            </li>
          ))
        ) : (
          <p>Pas de message dans ce salon</p>
        )}
      </ul>
    </>
  );
}
