import React from "react";
import { Avatar, Box, Text } from "@chakra-ui/react";

export default function UserListItem({ user, clickListItem }) {
  return (
    <Box
      onClick={clickListItem}
      cursor={"pointer"}
      bg={"#E8E8E8"}
      w={"100%"}
      display={"flex"}
      alignItems={"center"}
      color={"black"}
      p={"5px 10px"}
      mb={"10px"}
      borderRadius={"lg"}
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
    >
      <Avatar
        mr={2}
        size={"sm"}
        cursor={"pointer"}
        name={user.name}
        src={user.pic.url}
      />

      <Box>
        <Text>{user.name}</Text>
        <Text fontSize={"xs"}>
          <b>Email : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
}
