import React from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat.js";

export default function ChatBox() {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flexDir={"column"}
      alignItems={"center"}
      p={3}
      bg={"white"}
      w={{ base: "100%", md: "57%",lg: "64%"  }}
      borderRadius={"lg"}
      borderWidth={"1px"}
    >
      <SingleChat />
    </Box>
  );
}
