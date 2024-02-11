import CommandsList from "./CommandsList";
import ConversationList from "./ConversationList";
import Message from "./Message";
import RoomsList from "./RoomsList";
import UsersList from "./UserList";

export default function Main({
  publishMessage,
  rooms,
  setErrorCommand,
  activeTab,
  messages,
  users,
  activeRoom,
}) {
  return (
    <main style={{ height: "100%" }}>
      {activeTab === "commands" ? <CommandsList /> : null}
      {activeTab === "rooms" ? <RoomsList rooms={rooms} /> : null}
      {activeTab === "users" ? (
        <UsersList users={users} activeRoom={activeRoom} />
      ) : null}
      {activeTab === "messages" ? (
        <ConversationList messages={messages} activeRoom={activeRoom} />
      ) : null}

      <Message publishMessage={publishMessage} activeRoom={activeRoom} />
    </main>
  );
}
