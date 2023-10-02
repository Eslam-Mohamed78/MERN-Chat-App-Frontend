import { createContext, useContext, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

const chatContext = createContext();

export default function ChatProvider(props) {
  const [userInfo, setUserInfo] = useState(null);
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [reloadChats, setreloadChats] = useState(false);
  const [notifications, setnotifications] = useState([]);
  const [allmessages, setallmessages] = useState([]);

  // save logged user info
  function decodeUserInfo() {
    const encodedToken = localStorage.getItem("mern-chat-app");
    const decodedToken = jwt_decode(encodedToken);
    setUserInfo(decodedToken);
  }

  // prevent logout after refresh
  // state lose value after refresh > userInfo(null)
  useEffect(() => {
    if (localStorage.getItem("mern-chat-app")) {
      decodeUserInfo();
    }
  }, []);



  return (
    <chatContext.Provider
      value={{
        userInfo,
        setUserInfo,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        reloadChats,
        setreloadChats,
        notifications,
        setnotifications,
        allmessages,
        setallmessages,
        decodeUserInfo,
      }}
    >
      {props.children}
    </chatContext.Provider>
  );
}

export const ChatState = () => {
  return useContext(chatContext);
};
