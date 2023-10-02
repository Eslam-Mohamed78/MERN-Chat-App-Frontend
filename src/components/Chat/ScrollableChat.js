import { Avatar, Box, Text, Tooltip, VStack } from "@chakra-ui/react";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../../Context/ChatProvider.js";

export default function ScrollableChat() {
  const { userInfo, allmessages, setallmessages } = ChatState();
  const loggedUserId = userInfo.id;

  // Avatar will be displayed next to sender messages not loggedUser
  // 2 senarios to display the Avatar (2 cases for lastMessage from sender)
  // 1- next to last message in the chat is from sender.
  // (loggedUser didn't send messages after it)
  // 2- next to last message from sender (not all chat)
  // and loggedUser sent messages after it.

  const isLastMessageFromSender = (message, index) => {
    return (
      (index === allmessages.length - 1 && // it is last message
        allmessages[index].sender._id !== loggedUserId) || // lastMessage (current) is from sender (not loggedUser)
      (index < allmessages.length - 1 && // not the last message at chat
        allmessages[index].sender._id !== loggedUserId && // it is from sender
        allmessages[index + 1].sender._id !== message._id) // next message not from same sender (loggedUser or other)
    );
  };

  return (
    <ScrollableFeed style={{ display: "flex" }}>
      <VStack>
        {allmessages &&
          allmessages.map((message, index) => (
            <Box
              key={message._id}
              display={"flex"}
              alignItems={"center"}
              alignSelf={
                loggedUserId === message.sender._id ? "flex-end" : "flex-start"
              }
              justifyContent={
                loggedUserId === message.sender._id ? "flex-end" : "none"
              }
              maxW={"75%"}
            >
              {/* to display avatar or not */}
              {isLastMessageFromSender(message, index) ? (
                <Tooltip
                  label={message.sender.name}
                  placement="bottom-start"
                  hasArrow
                >
                  <Avatar
                    mr={"7px"}
                    size={"xs"}
                    cursor={"pointer"}
                    name={message.sender.name.url}
                    src={message.sender.pic.url}
                  />
                </Tooltip>
              ) : null}

              <Text
                bg={message.sender._id === loggedUserId ? "#BEE3F8" : "#B9F5D0"}
                borderRadius={"20px"}
                padding={"5px 15px"}
                w={"100%"}
              >
                {message.content}
              </Text>
            </Box>
          ))}
      </VStack>
    </ScrollableFeed>
  );
}
