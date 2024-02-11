import "./App.css";
import { socket } from "./socket";
import React, { useState, useEffect } from "react";
import { PiPlugsBold } from "react-icons/pi";
import { PiPlugsConnectedBold } from "react-icons/pi";
import { IoIosSend } from "react-icons/io";
import { IoMdAddCircleOutline } from "react-icons/io";
import {
  Input,
  InputRightElement,
  InputGroup,
  Button,
  Box,
  Text,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  StackDivider,
} from "@chakra-ui/react";

function Message({ message, deleteMessage }) {
  return (
    <Box display={"flex"} justifyContent={"space-between"}>
      <div>
        <Heading size="xs" textTransform="uppercase">
          {message.author}
        </Heading>
        <Text fontSize={"xs"}>{message.date}</Text>
      </div>
      <Text pt="2" fontSize="sm">
        {message.text}
      </Text>
      <Button
        size={"xs"}
        colorScheme={"red"}
        onClick={() => deleteMessage(message)}
      >
        X
      </Button>
    </Box>
  );
}

function MessageInput({ publishMessage }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        publishMessage(e.target[0].value);
      }}
    >
      <InputGroup>
        <Input type="text" placeholder="Send a message" />
        <InputRightElement width="4.5rem">
          <button type="submit">
            <IoIosSend />
          </button>
        </InputRightElement>
      </InputGroup>
    </form>
  );
}



function ChannelList({ rooms, deleteRoom, joinRoom }) {
  return rooms.length ? (
    <Stack style={{ display: "flex", flexWrap: "wrap" }}>
      {rooms.map((room) => (
        <Box key={room.name}>
          <Button
            size={"xs"}
            colorScheme={"red"}
            onClick={() => deleteRoom(room.name)}
          >
            x
          </Button>
          
          <Button
            size={"xs"}
            colorScheme={"teal"}
            onClick={() => joinRoom(room.name)}
          >
            {room.name}
          </Button>
        </Box>
      ))}
    </Stack>
  ) : (
    <p>There are no rooms yet</p>
  );
}
function NewChannelForm({ createRoom }) {
  return (
    <form
      id="create-channel-input"
      onSubmit={(e) => {
        e.preventDefault();
        createRoom(e.target[0].value);
      }}
    >
      <InputGroup>
        <Input type="text" placeholder="Create a channel" />
        <InputRightElement width="4.5rem">
          <button type="submit">
            <IoMdAddCircleOutline />
          </button>
        </InputRightElement>
      </InputGroup>
    </form>
  );
}

function Conversation({ messages, deleteMessage, publishMessage, room }) {
  return (
    <Card>
      <CardHeader>
        {room && <Heading size="md">{room.name}</Heading>}
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing="4" flexWrap={"wrap"}>
          {room &&
            messages.map((message, key) => (
              <Message
                key={key}
                message={message}
                deleteMessage={deleteMessage}
              />
            ))}

          <MessageInput publishMessage={publishMessage} />
        </Stack>
      </CardBody>
    </Card>
  );
}

function Adelete() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [rooms, setRooms] = useState([]);
  const [joinedRooms, setJoinedRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [messages, setMessages] = useState([]);

  console.log(rooms);

  function createRoom(room) {
    socket.emit("create room", room);
  }

  function changeRoom(room) {
    socket.emit("change room", room);
  }

  function joinRoom(room) {
    socket.emit("join room", room);
  }

  function deleteRoom(room) {
    socket.emit("delete room", room);
  }

  function publishMessage(message) {
    const commands = [
      "/nick",
      "/list",
      "/create",
      "/delete",
      "/join",
      "/quit",
      "/users",
      "/msg",
    ];
    if (message[0] === "/")
      switch (message) {
        case "/list":
          console.log("list!");
          socket.emit("get all rooms");
          setActiveTab(() => "list");

          break;
        case "/users":
          console.log("users!");
          setActiveTab(() => "users");
          break;
      }
    else socket.emit("publish message", message);
  }

  function deleteMessage(message) {
    socket.emit("delete message", message);
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onGetRooms(rooms) {
      setRooms(() => rooms);
      // setActiveRoom(() => rooms[0]);
    }

    socket.on("connected", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("rooms", onGetRooms);
    socket.on("joined rooms", (channels) => {
      setJoinedRooms(() => channels);
    });
    socket.on("display message", (value) => {
      setMessages(() => value);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("rooms", onGetRooms);
    };
  }, [rooms]);

  return (
    <div className="App">
      {isConnected ? (
        <PiPlugsConnectedBold size={"3em"} />
      ) : (
        <PiPlugsBold size={"3em"} />
      )}
      <ul>
        {joinedRooms.map((c) => (
          <li>
            <Button onClick={() => changeRoom(c.name)}>{c.name}</Button>
          </li>
        ))}
      </ul>
      <NewChannelForm createRoom={createRoom} />
      <Conversation
        room={activeRoom}
        messages={messages}
        deleteMessage={deleteMessage}
        publishMessage={publishMessage}
      />
      {activeTab === null || (activeTab === "list" && rooms) ? (
        <ChannelList
          rooms={rooms}
          deleteRoom={deleteRoom}
          joinRoom={joinRoom}
        />
      ) : activeTab === "users" ? (
        <h1>a list of users will be displayed here</h1>
      ) : (
        // <UserList users={users}/>
        "this is awkward"
      )}
    </div>
  );
}

export default ADelete;
