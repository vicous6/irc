// import { useState } from "react";
// import { socket } from "../socket";

export default function Message({ publishMessage, activeRoom }) {
  // const [message, setMessage] = useState("");

  // const handleChange = (e) => {
  //   const { value } = e.target;
  //   setMessage(value);
  // };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newMessage = e.target[0].value;
    document.getElementById("input").value = "";
    publishMessage(newMessage, activeRoom);
  };

  return (
    <form style={{ height: "15%" }} onSubmit={handleSubmit}>
      <input
        id="input"
        placeholder="/commands to see all commands"
        style={{
          border: "5px solid black",
          height: "100%",
          width: "80%",
          padding: "1rem",
        }}
        type="text"
        name="msg"
        // value={message}
        // onChange={handleChange}
      />
      <button style={{ width: "20%" }} type="submit">
        Envoyer
      </button>
    </form>
    // {}
  );
}
