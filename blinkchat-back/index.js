import express from "express";
import http from "http";
import { join } from "path";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import Repository from "./data/Repository.js";

const app = express();
const server = http.createServer(app); // Create an HTTP server
const port = process.env.PORT || 10000;
const io = new Server(server, corsOptions);
const corsOptions = {
  "force new connection": true,
  origin: "https://irc-2exc.vercel.app/",
  methods: ["GET", "POST"], // Specify the allowed HTTP methods
};
//irc-2exc-4bo8gkrru-vicous6.vercel.app/
// Use CORS middleware with the specified options
https: app.use(cors(corsOptions));
let socketsList = [];
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority`;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(" Connection to Mongoose successful"))
  .catch(() => console.log("Connection to M ongoose failed"));

// io.listen(3010);
app.get("/", (req, res) => {
  // res.sendFile(join(__dirname, "index.html"));
  res.send("response");
  console.log("new connection");
});

function emitMessagesToAllUSers(messagesTab, roomName) {
  // console.log(message + activeRoom + nickname);
  repository.getChannelByName(roomName).then((channel) => {
    for (let i = 0; i < socketsList.length; i++) {
      for (let j = 0; j < channel.users.length; j++) {
        // console.log(socketsList[i].name);
        // console.log(channel.users[j]);
        if (socketsList[i].name === channel.users[j]) {
          console.log(socketsList.length + " personnes connectées");
          console.log("message envoyé a " + socketsList[i].name);
          console.log(roomName);

          let bool = "update";
          socketsList[i].socket.emit(
            "display messages",
            messagesTab,
            roomName,
            bool
          );
          // socket.emit("display messages", res, roomName, "get");
        }
      }
    }
  });
}
function emitPopUpToAllUSersOfTheRoom(roomName, senderNickname, message) {
  // console.log(message + activeRoom + nickname);
  // console.log(message);
  repository.getChannelByName(roomName).then((channel) => {
    for (let i = 0; i < socketsList.length; i++) {
      for (let j = 0; j < channel.users.length; j++) {
        // console.log(socketsList[i].name + " " + channel.users[j]);
        // console.log(socketsList[i].name === channel.users[j]);
        if (socketsList[i].name === channel.users[j]) {
          console.log("pop up envoyé a " + socketsList[i].name);

          socketsList[i].socket.emit(
            "pop up",
            roomName,
            senderNickname,
            message
          );
        }
      }
    }
  });
}
let repository = new Repository();
function sendTo(name) {}
io.on("connection", (socket) => {
  // repository.addMessage("moi", "coucou les gars", "&").then((res) => {
  //   console.log(res);
  // });cr
  console.log("connected");

  socket.emit("connected");

  socket.on("give me all users", (roomName) => {
    // console.log(roomName);
    let truc = repository.getChannelByName(roomName).then((truc) => {
      // console.log(truc.commandResult);
      if (truc.commandResult === "error") {
        socket.emit("error");
      } else {
        // console.log(truc.users);
        socket.emit("users", truc.users);
      }

      // socket.emit("rooms", truc);
    });
  });
  socket.on("quit room", (roomName, nickname) => {
    let truc = repository
      .removeUserFromChannel(roomName, nickname)
      .then((truc) => {
        // console.log(truc);
        if (truc.commandResult === "success") {
          let joinedRooms = repository
            .getUserSubscribedChannels(nickname)
            .then((joinedRooms) => {
              if (joinedRooms.commandResult === "error") {
                socket.emit("error");
              } else {
                // console.log(joinedRooms);
                socket.emit("joined rooms", joinedRooms, "delete", roomName);
                emitPopUpToAllUSersOfTheRoom(
                  roomName,
                  nickname,
                  `${nickname} a quitté le salon ${roomName}`
                );
              }
            });
        } else {
          socket.emit("error");
        }
      });
  });
  socket.on("join room", (roomName, nickname) => {
    // console.log("Je suis " + nickname + " et je veux rejoindre: " + roomName);
    let truc = repository.addUserToChannel(roomName, nickname).then((truc) => {
      // console.log(truc);
      if (truc.commandResult === "success") {
        let joinedRooms = repository
          .getUserSubscribedChannels(nickname)
          .then((joinedRooms) => {
            if (joinedRooms.commandResult === "error") {
              socket.emit("error");
            } else {
              socket.emit("joined rooms", joinedRooms, "add", roomName);
              emitPopUpToAllUSersOfTheRoom(
                roomName,
                nickname,
                `${nickname} a rejoint le salon ${roomName}`
              );
            }
          });
      } else {
        socket.emit("error");
      }
    });
  });
  socket.on("get all rooms", () => {
    let truc = repository.getChannels().then((truc) => {
      socket.emit("rooms", truc);
    });
  });
  socket.on("change name", (name) => {
    // console.log(socket);
    repository.login(name).then((truc) => {
      // console.log(truc.commandResult);
      if (truc.commandResult === "success") {
        socket.emit("nickname ok", name);

        for (let i = 0; i < socketsList.length; i++) {
          if (socketsList[i].socket === socket) {
            socketsList[i].name = name;
            // console.log(socketsList);
          }
        }
      } else {
        socket.emit("nickname not allow");
      }

      // socket.emit("rooms", truc);
    });
  });
  socket.on("choose name", (name) => {
    repository.login(name).then((truc) => {
      // console.log(truc.commandResult);
      if (truc.commandResult === "success") {
        socket.emit("nickname ok", name);
        socketsList.push({ name: name, socket: socket });
        console.log(socketsList.length + "personnes connecté");
        // console.log(socketsList);
        // console.log(socketsList.length);
      } else {
        socket.emit("choose another nickname");
      }

      // socket.emit("rooms", truc);
    });
  });

  socket.on("create room", (roomName, author) => {
    // console.log("Je suis " + author);
    // console.log("demande de creation de " + roomName);
    let truc = repository.addChannel(roomName, author).then((truc) => {
      if (truc.commandResult === "success") {
        let truc = repository.getChannels().then((truc) => {
          socket.emit("rooms", truc);
          let joinedRooms = repository
            .getUserSubscribedChannels(author)
            .then((joinedRooms) => {
              if (joinedRooms.commandResult === "error") {
                socket.emit("error");
              } else {
                // console.log(joinedRooms);
                socket.emit("joined rooms", joinedRooms, "add", roomName);
              }
            });
        });
      } else {
        socket.emit("error");
      }
    });
    // repository.addChannel(roomName, author);

    // setTimeout(() => {
    //   let channels = repository.getChannels().then((channels) => {
    //     socket.emit("rooms", channels);
    //   });
    // }, 1000);

    // gerer lidentité avec des cookies ?
  });
  socket.on("delete room", (roomName) => {
    console.log("deleting room " + roomName);
    let truc = repository.deleteChannel(roomName).then((truc) => {
      if (truc.commandResult === "success") {
        let truc = repository.getChannels().then((truc) => {
          socket.emit("rooms", truc);
          let joinedRooms = repository
            .getUserSubscribedChannels(roomName)
            .then((joinedRooms) => {
              if (joinedRooms.commandResult === "error") {
                socket.emit("error");
              } else {
                console.log(joinedRooms);
                socket.emit("joined rooms", joinedRooms, "delete", roomName);
              }
            });
        });
      } else {
        socket.emit("error");
      }
    });
  });

  socket.on("get messages", (roomName) => {
    console.log("je veux les messages de la room " + roomName);
    let truc = repository.getMessagesByChannel(roomName).then((res) => {
      // console.log(res + "zefezfz");
      if (res.commandResult === "error") {
        socket.emit("error");
      } else {
        // console.log(room);
        console.log(typeof roomName);
        console.log("get: " + roomName);
        socket.emit("display messages", res, roomName, "get");
      }
    });
  });
  socket.on("publish message", (message, activeRoom, nickname) => {
    // console.log(activeRoom, nickname);
    console.log(activeRoom + " " + nickname);
    let truc = repository
      .addMessage(nickname, message, activeRoom)
      .then((truc) => {
        repository.getMessagesByChannel(activeRoom).then((res) => {
          // console.log(res);
          if (res.commandResult === "error") {
            socket.emit("error");
          } else {
            emitMessagesToAllUSers(res, activeRoom);
          }
        });
      });
    // console.log("publishing message: " + message);
  });
  socket.on("delete message", (message) => {
    console.log("deleting message: " + message);
  });

  socket.on("disconnect", () => {
    let username;
    for (let i = 0; i < socketsList.length; i++) {
      if (socket === socketsList[i].socket) {
        username = socketsList[i].name;
        socketsList.splice(i, 1);
        console.log(socketsList.length + " conncété");
      }
    }
    let joinedRooms = repository
      .getUserSubscribedChannels(username)
      .then((joinedRooms) => {
        if (joinedRooms.commandResult === "error") {
          socket.emit("error");
        } else {
          // console.log(joinedRooms);
          for (let index = 0; index < joinedRooms.length; index++) {
            let truc = repository
              .removeUserFromChannel(joinedRooms[index].name, username)
              .then((truc) => {
                // console.log(truc);
              });
          }
        }
      });
    repository.logout(username).then((res) => {
      console.log(res);
    });
    console.log(socketsList.length);
    console.log("user disconnected");
  });
});
server.listen(port);
//liste des choses a faire

// ondeconect : send pop up to all users from all salons where users has joined
