import { io } from "socket.io-client";

export const socket = io("https://back-end-irc.onrender.com:3010", {
  forceNew: true,
  origin: "https://back-end-irc.onrender.com:3010",
});
