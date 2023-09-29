import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider.js";
import ProfileModal from "./ProfileModal.js";
import axios from "axios";
import SideDrawer from "../SideDrawer/SideDrawer.js";

export default function NavBar() {
  const {
    userInfo,
    setUserInfo,
    notifications,
    setSelectedChat,
    setnotifications,
  } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  // Handle LogOut
  const logoutHandler = async () => {
    // un validate the token in DB
    const token = `${process.env.REACT_APP_BEARER_KEY}${localStorage.getItem("mern-chat-app")}`;
    const config = {
      headers: {
        token,
        // "content-type": "application/json",
        // gives error because BE need the token as string not json.
      },
    };

    await axios
      .patch(`${process.env.REACT_APP_BASE_URL}/auth/logout`, null, config)
      .then((res) => {
        console.log(res.data);
        toast({
          description: "Signed Out Successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        localStorage.removeItem("mern-chat-app");
        setUserInfo(null);
        navigate("/");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // get partner in given chat
  const partner = (chat) => {
    const partner = chat?.users.filter((user) => user._id !== userInfo.id);
    return partner[0];
  };

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        bg={"white"}
        w={"100%"}
        h={"9vh"}
        p={"5px 10px"}
        borderWidth={5}
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant={"ghost"} onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px={"4"}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text
          fontSize={"3xl"}
          fontFamily={"Work sans"}
          fontWeight={"bold"}
          color="#2C7A7B"
        >
          We Chat
        </Text>

        <Box>
          <Menu>
            <MenuButton p={1}>
              {notifications.length > 0 && (
                <Badge colorScheme="red">{notifications.length}</Badge>
              )}

              <BellIcon fontSize={"2xl"} m={1}></BellIcon>
            </MenuButton>

            <MenuList>
              {notifications.length ? (
                notifications.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chatId);
                      setnotifications(
                        notifications.filter((n) => n !== notif)
                      );
                    }}
                  >
                    {notif.chatId.isGroupChat
                      ? `New Message in ${notif.chatId.chatName}`
                      : `New Message From ${partner(notif.chatId).name}`}
                  </MenuItem>
                ))
              ) : (
                <MenuItem>No New Messages</MenuItem>
              )}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size={"sm"}
                cursor={"pointer"}
                name={userInfo.name}
                src={userInfo.pic}
              />
            </MenuButton>

            <MenuList>
              <ProfileModal>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>

              <MenuDivider />

              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      <SideDrawer isOpen={isOpen} onClose={onClose} />
    </>
  );
}
