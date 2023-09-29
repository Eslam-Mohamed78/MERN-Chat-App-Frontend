import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import {
  Box,
  Button,
  HStack,
  Stack,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import ChatLoading from "./ChatLoading.js";
import CreateGroupChatModal from "../GroupChat/CreateGroupChatModal.js";

export default function MyChats() {
  const [isloading, setisloading] = useState(false);
  const toast = useToast();
  const {
    socket,
    userInfo,
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    reloadChats,
  } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const chatName = (chat) => {
    const partner = chat?.users.filter((user) => user._id !== userInfo.id);
    return partner[0].name;
  };

  // global for any fetch method
  const token = `${process.env.REACT_APP_BEARER_KEY}${localStorage.getItem("mern-chat-app")}`;
  const config = {
    headers: {
      "content-type": "application/json",
      token,
    },
  };

  const getUserChats = async () => {
    setisloading(true);

    await axios
      .get(`${process.env.REACT_APP_BASE_URL}/chat`, config)
      .then(async(res) => {
        console.log("chats: ", res.data);
        setisloading(false);
        await setChats(res.data.results);

        // join chat rooms (socket) to get notifications
        res.data.results?.map((chat) => {
          socket.emit("join chat", chat._id);
        });
      })
      .catch((error) => {
        console.error(error);
        setisloading(false);
        toast({
          description: "Failed to load user chats!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  useEffect(() => {
    getUserChats();
  }, [reloadChats]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir={"column"}
      alignItems={"center"}
      p={3}
      bg={"white"}
      w={{ base: "100%", md: "42%", lg: "35%" }}
      borderRadius={"lg"}
      borderWidth={"1px"}
    >
      <HStack justifyContent={"space-between"} w={"100%"} px={2} pb={3}>
        <Text
          fontSize={"25px"}
          fontFamily={"work sans"}
          fontWeight={"semibold"}
          color="#2C7A7B"
        >
          My Chats
        </Text>
        <Button
          display={"flex"}
          fontSize={{ base: "15px", md: "13px", lg: "15px" }}
          rightIcon={<AddIcon ml={1} />}
          onClick={onOpen}
        >
          New Group Chat
        </Button>
        <CreateGroupChatModal isOpen={isOpen} onClose={onClose} />{" "}
        {/* component */}
      </HStack>

      <VStack
        p={3}
        bg={"#F8F8F8"}
        w={"100%"}
        h={"100%"}
        borderRadius={"lg"}
        overflowY={"hidden"}
      >
        {chats ? (
          <Stack overflowY={"scroll"} w={"100%"}>
            {chats.map((chat) => (
              <Box
                key={chat._id}
                cursor={"pointer"}
                bg={selectedChat?._id === chat._id ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat?._id === chat._id ? "white" : "black"}
                py={2}
                px={3}
                borderRadius={"lg"}
                onClick={() => setSelectedChat(chat)}
              >
                <Text>{chat.isGroupChat ? chat.chatName : chatName(chat)}</Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </VStack>
    </Box>
  );
}
