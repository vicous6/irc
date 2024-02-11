import { io } from "socket.io-client";

export const socket = io("https://back-end-irc.onrender.com:10000", {
  forceNew: true,
  origin: "https://back-end-irc.onrender.com:3010",
});
