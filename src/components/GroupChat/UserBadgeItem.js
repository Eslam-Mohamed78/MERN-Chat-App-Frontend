import React from "react";
import { HStack, Text } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

export default function UserBadgeItem({ user, deleteBadge }) {
  return (
    <HStack
      alignItems={"center"}
      px={2}
      py={1}
      m={"0.5px"}
      mb={0.5}
      borderRadius={"md"}
      fontSize={12}
      bgColor={"#2C7A7B"}
      color={"white"}
      cursor={"pointer"}
      onClick={deleteBadge}
    >
      <Text
        fontFamily={"work sans"}
        fontWeight={"bold"}
        fontSize={"12px"}
        letterSpacing={"wide"}
      >
        {user.name}
      </Text>
      <CloseIcon pl={1} />
    </HStack>
  );
}
