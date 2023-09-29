import React from "react";
import { Box } from "@chakra-ui/react";
import MyChats from "../components/Chat/MyChats.js";
import ChatBox from "../components/Chat/ChatBox.js";
import { ChatState } from "../Context/ChatProvider.js";
import NavBar from "../components/NavBar/NavBar.js";

export default function ChatPage() {
  const { userInfo } = ChatState();

  return (
    <div style={{ width: "100%" }}>
      {userInfo && <NavBar />}

      <Box
        display="flex"
        justifyContent={"space-between"}
        w={"100%"}
        h={"91vh"}
        p={"10px"}
      >
        {userInfo && <MyChats />}
        {userInfo && <ChatBox />}
      </Box>
    </div>
  );
}
