import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider.js";
import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Button,
  HStack,
  VStack,
  FormControl,
  Input,
  FormErrorMessage,
  useToast,
  Box,
} from "@chakra-ui/react";
import UserBadgeItem from "./UserBadgeItem.js";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import UserListItem from "../SideDrawer/UserListItem.js";

export default function UpdateGroupChatModal({ getAllMessages }) {
  const {
    selectedChat,
    setSelectedChat,
    userInfo,
    reloadChats,
    setreloadChats,
  } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupMembers, setgroupMembers] = useState([]);
  const [updateChatNameLoading, setupdateChatNameLoading] = useState(false);
  const [addUserLoading, setaddUserLoading] = useState(false);
  const [removeUserLoading, setremoveUserLoading] = useState(false);
  const [searchUsersLoading, setsearchUsersLoading] = useState(false);
  const [searchResult, setsearchResult] = useState([]);
  const toast = useToast();

  // get group members without logged user
  // compart objectId as string (inf loop error)
  const members = async () => {
    const currGroupMembers = await selectedChat?.users.filter(
      (user) => user._id.toString() !== userInfo.id.toString()
    );
    setgroupMembers(currGroupMembers);
  };

  useEffect(() => {
    members();
  }, [selectedChat]);

  // global for any fetch method
  const token = `${process.env.REACT_APP_BEARER_KEY}${localStorage.getItem("mern-chat-app")}`;
  const config = {
    headers: {
      "content-type": "application/json",
      token,
    },
  };

  //************* Update ChatName Form ***************//
  // validation shcema
  const updateChatNameSchema = Yup.object({
    chatName: Yup.string()
      .min(3, "Chat Name min length is 3")
      .max(25, "Chat Name max length is 25")
      .required("Chat Name is required"),
  });

  // update chat request
  const updateChatName = async (values) => {
    setupdateChatNameLoading(true);

    await axios
      .patch(`${process.env.REACT_APP_BASE_URL}/chat/rename`, values, config)
      .then((res) => {
        console.log(res.data);
        setupdateChatNameLoading(false);
        setreloadChats(!reloadChats); // to reload new chats
        setSelectedChat(res.data.results);
      })
      .catch((error) => {
        console.error(error);
        setupdateChatNameLoading(false);
        toast({
          description: "Failed to update group chat name!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  const updateChatNameForm = useFormik({
    initialValues: {
      chatName: "",
      chatId: selectedChat._id,
    },
    onSubmit: updateChatName,
    validationSchema: updateChatNameSchema,
  });

  //************* Search Users Form ***************//
  // validation shcema
  const searchUsersSchema = Yup.object({
    search: Yup.string().required("UserName or Email is required"),
  });

  // search users request
  const searchUsers = async (values) => {
    setsearchUsersLoading(true);

    await axios
      .get(`${process.env.REACT_APP_BASE_URL}/user?search=${values.search}`, config)
      .then(async (res) => {
        console.log(res.data);
        setsearchUsersLoading(false);

        // remove curr group members from search result
        let allowedToAdd = [];
        outerLoop: for (const user of res?.data?.results) {
          for (const member of selectedChat.users) {
            if (member._id.toString() === user._id.toString()) {
              continue outerLoop;
            }
          }
          allowedToAdd.push(user);
        }

        setsearchResult(allowedToAdd);
      })
      .catch((error) => {
        console.error(error);
        setsearchUsersLoading(false);
        toast({
          description: "Failed to load the search results!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  const searchUsersForm = useFormik({
    initialValues: {
      search: "",
    },
    onSubmit: searchUsers,
    validationSchema: searchUsersSchema,
  });

  // filter returns array
  const groupAdmin = selectedChat.users.filter(
    (user) => user._id === selectedChat.groupAdmin._id
  );

  //************* Add User To Group ***************//
  const addUserToGroup = async (userId) => {
    // check if logged user is admin
    if (groupAdmin[0]._id.toString() !== userInfo.id.toString()) {
      toast({
        description: `Only group admin (${groupAdmin[0].name}) can add members!`,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    const values = {
      chatId: selectedChat._id,
      memberId: userId,
    };

    setaddUserLoading(true);
    await axios
      .patch(`${process.env.REACT_APP_BASE_URL}/chat/addToGroup`, values, config)
      .then(async (res) => {
        console.log(res.data);
        setaddUserLoading(false);
        setreloadChats(!reloadChats); // to reload new chats
        setSelectedChat(res.data.results);

        // remove added user from searchResult
        const newUsers = await searchResult.filter((u) => u._id !== userId);
        setsearchResult(newUsers);
      })
      .catch((error) => {
        console.error(error);
        setaddUserLoading(false);
        toast({
          description: "Failed to add user to group!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  //************* Remove User From Group ***************//
  const removeUserFromGroup = async (userId, leave = false) => {
    // check if logged user is admin incase of remove not leave
    // any one can leave not only admin
    if (!leave) {
      if (groupAdmin[0]._id.toString() !== userInfo.id.toString()) {
        toast({
          description: `Only group admin (${groupAdmin[0].name}) can remove members!`,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
        return;
      }
    }

    const values = {
      chatId: selectedChat._id,
      memberId: userId,
    };

    setremoveUserLoading(true);
    await axios
      .patch(`${process.env.REACT_APP_BASE_URL}/chat/removeFromGroup`, values, config)
      .then(async (res) => {
        console.log(res.data);
        setremoveUserLoading(false);
        setreloadChats(!reloadChats); // to reload the chats
        getAllMessages(); // to reload the messages
        leave ? setSelectedChat() : setSelectedChat(res.data.results);
      })
      .catch((error) => {
        console.error(error);
        setremoveUserLoading(false);
        toast({
          description: "Failed to remove user from group!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"40px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            {selectedChat?.chatName}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack>
              {/* render current group members */}
              {addUserLoading || removeUserLoading ? (
                <Button isLoading></Button>
              ) : (
                <HStack w={"100%"} flexWrap={"wrap"}>
                  {groupMembers?.map((user) => (
                    <UserBadgeItem
                      key={user._id}
                      user={user}
                      deleteBadge={() => removeUserFromGroup(user._id)}
                    />
                  ))}
                </HStack>
              )}

              <form style={{ width: "100%", marginBottom: "5px" }}>
                <FormControl
                  id="newChatName"
                  isRequired
                  isInvalid={
                    updateChatNameForm.errors.chatName &&
                    updateChatNameForm.touched.chatName
                  }
                >
                  <Box display={"flex"}>
                    <Input
                      type="text"
                      name="chatName"
                      placeholder="New Chat Name"
                      onChange={updateChatNameForm.handleChange}
                      onBlur={updateChatNameForm.handleBlur}
                      value={updateChatNameForm.values.chatName}
                    />

                    {updateChatNameLoading ? (
                      <Button isLoading></Button>
                    ) : (
                      <Button
                        type="submit"
                        bgColor="teal.400"
                        color={"white"}
                        ml={2}
                        isDisabled={
                          !(
                            updateChatNameForm.dirty &&
                            updateChatNameForm.isValid
                          )
                        }
                        onClick={updateChatNameForm.handleSubmit}
                      >
                        Update
                      </Button>
                    )}
                  </Box>

                  <FormErrorMessage>
                    {updateChatNameForm.errors.chatName}
                  </FormErrorMessage>
                </FormControl>
              </form>

              <form style={{ width: "100%" }}>
                <FormControl
                  id="name"
                  isRequired
                  isInvalid={
                    searchUsersForm.errors.search &&
                    searchUsersForm.touched.search
                  }
                >
                  <Input
                    type="text"
                    name="search"
                    onChange={searchUsersForm.handleChange}
                    onBlur={searchUsersForm.handleBlur}
                    value={searchUsersForm.values.search}
                    placeholder="Add User to group"
                    onKeyUp={searchUsersForm.handleSubmit}
                  />
                  <FormErrorMessage>
                    {searchUsersForm.errors.search}
                  </FormErrorMessage>
                </FormControl>
              </form>

              {/* render search results */}
              {searchUsersLoading ? (
                <Button isLoading></Button>
              ) : (
                <Box overflowY={"scroll"} w={"100%"} maxH={"250px"}>
                  {searchResult?.map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      clickListItem={() => addUserToGroup(user._id)}
                    />
                  ))}
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              onClick={() => removeUserFromGroup(userInfo.id, true)}
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
