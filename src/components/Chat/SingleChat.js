import React, { useEffect, useRef, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import {
  Box,
  FormControl,
  HStack,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "../NavBar/ProfileModal.js";
import UpdateGroupChatModal from "../GroupChat/UpdateGroupChatModal.js";
import axios from "axios";
import ScrollableChat from "./ScrollableChat.js";

export default function SingleChat() {
  const {
    socket,
    userInfo,
    selectedChat,
    setSelectedChat,
    notifications,
    setnotifications,
    reloadChats,
    setreloadChats,
  } = ChatState();
  const [messagesLoading, setmessagesLoading] = useState(false);
  const [newMessage, setnewMessage] = useState("");
  const [allmessages, setallmessages] = useState([]);
  const toast = useToast();
  const selectedChatRef = useRef(selectedChat);

  //*********** Socket-Client **********//
  // we need to send message to DB & socket-room
  // Both in sendMessage() function

  // we need to recieve messages that come from any
  // room we are in.
  // If the room(chat) isn't the current chat we send
  // notification to that chat.

  // selectedChat loose its value inside socket.on so make ref for it.
  useEffect(() => {
    socket.on("recieveMessage", (chat) => {
      if (selectedChatRef?.current?._id === chat.chatId._id) {
        setallmessages((allmessages) => [...allmessages, chat]);
      } else {
        // send notification
        if (!notifications.includes(chat)) {
          setnotifications((notifications) => [...notifications, chat]);
          setreloadChats(!reloadChats);
        }
      }
    });
  }, []);

  useEffect(() => {
    getAllMessages();

    // Update the ref whenever selectedChat changes
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  /////////////////////////////////////////////////

  // global for any fetch method
  const token = `${process.env.REACT_APP_BEARER_KEY}${localStorage.getItem(
    "mern-chat-app"
  )}`;
  const config = {
    headers: {
      "content-type": "application/json",
      token,
    },
  };

  // get partner in given chat
  const partner = (chat) => {
    const partner = chat?.users.filter((user) => user._id !== userInfo.id);
    return partner[0];
  };

  // get all messages
  const getAllMessages = async () => {
    if (!selectedChat) return;

    setmessagesLoading(true);
    await axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/message/${selectedChat._id}`,
        config
      )
      .then((res) => {
        console.log("messages:", res.data);
        setmessagesLoading(false);
        setallmessages(res.data.results);
      })
      .catch((error) => {
        console.error(error);
        setmessagesLoading(false);
        toast({
          description: "Failed to get messages!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  // send message request
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      const values = {
        chatId: selectedChat._id,
        content: newMessage,
      };

      // send message to DB
      await axios
        .post(`${process.env.REACT_APP_BASE_URL}/message`, values, config)
        .then((res) => {
          console.log(res.data);

          // send message to a socket-room.
          const chat = res.data.results;
          socket.emit("newMessage", chat);

          // setallmessages([...allmessages, res.data.results]);
          setnewMessage("");
        })
        .catch((error) => {
          console.error(error);

          toast({
            description: "Failed to send message!",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom-left",
          });
        });
    }
  };

  return (
    <>
      {selectedChat ? (
        <VStack w={"100%"} h={"100%"}>
          <HStack
            fontFamily={"work sans"}
            fontSize={{ base: "28px", lg: "30px" }}
            pb={3}
            px={2}
            w={"100%"}
            justifyContent={{ base: "space-between" }}
          >
            <IconButton
              display={{ base: "flex", lg: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            <Text>
              {selectedChat.isGroupChat
                ? selectedChat.chatName
                : partner(selectedChat).name}
            </Text>

            {selectedChat?.isGroupChat ? (
              <UpdateGroupChatModal getAllMessages={getAllMessages} />
            ) : (
              <ProfileModal user={partner(selectedChat)} />
            )}
          </HStack>

          <Box
            p={3}
            bg={"#E8E8E8"}
            w={"100%"}
            h={"100%"}
            borderRadius={"lg"}
            overflowY={"hidden"}
            display={"flex"}
            flexDir={"column"}
            justifyContent={"space-between"}
          >
            {messagesLoading ? (
              <Box display={"flex"} w={"100%"} h={"100%"}>
                <Spinner size={"xl"} w={20} h={20} margin={"auto"} />
              </Box>
            ) : (
              <Box display={"flex"} flexDir={"column"} overflowY={"scroll"}>
                <ScrollableChat allmessages={allmessages} />
              </Box>
            )}

            <FormControl
              id="newChatName"
              isRequired
              mt={3}
              onKeyDown={sendMessage}
            >
              <Input
                type="text"
                name="message"
                placeholder="Enter a message..."
                onChange={(e) => setnewMessage(e.target.value)}
                value={newMessage}
                variant={"filled"}
                bg={"#E0E0E0"}
              />
            </FormControl>
          </Box>
        </VStack>
      ) : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          h={"100%"}
        >
          <Text
            fontFamily={"work sans"}
            fontSize={"3xl"}
            p={3}
            textAlign={"center"}
          >
            Click on a user to start chatting.
          </Text>
        </Box>
      )}
    </>
  );
}
