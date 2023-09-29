import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider.js";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import mongoose from "mongoose";
import UserListItem from "../SideDrawer/UserListItem.js";
import UserBadgeItem from "./UserBadgeItem.js";

export default function CreateGroupChatModal({ isOpen, onClose }) {
  const [searchUsersLoading, setsearchUsersLoading] = useState(false);
  const [createGroupLoading, setcreateGroupLoading] = useState(false);
  const [searchResult, setsearchResult] = useState([]);
  const [users, setusers] = useState([]);
  const toast = useToast();
  const { chats, setChats } = ChatState();

  // global for any fetch method
  const token = `${process.env.REACT_APP_BEARER_KEY}${localStorage.getItem("mern-chat-app")}`;
  const config = {
    headers: {
      "content-type": "application/json",
      token,
    },
  };

  //************** Create Group Form *****************//
  // validation shcema
  const createGroupSchema = Yup.object({
    chatName: Yup.string()
      .min(3, "Name min length is 3")
      .max(25, "Name max length is 25")
      .required("Chat name is required!"),
    users: Yup.array()
      .of(
        Yup.string().test("testObjectId", "Invalid User Id!", (value) => {
          return mongoose.Types.ObjectId.isValid(value);
        })
      )
      .required("Add members to the group!")
      .min(2, "At least add 2 members"),
  });

  // create group request
  const createGroupChat = async (values) => {
    setcreateGroupLoading(true);

    await axios
      .post(`${process.env.REACT_APP_BASE_URL}/chat/group`, values, config)
      .then((res) => {
        console.log(res.data);
        setcreateGroupLoading(false);
        setChats([res.data.results, ...chats]);
      })
      .catch((error) => {
        console.error(error);
        setcreateGroupLoading(false);
        toast({
          description: "Failed to create group chat!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  const createGroupForm = useFormik({
    initialValues: {
      chatName: "",
      users: [],
    },
    onSubmit: createGroupChat,
    validationSchema: createGroupSchema,
  });

  const AddToUsersList = (user) => {
    const usersList = createGroupForm.values.users;

    if (usersList.includes(user._id)) {
      createGroupForm.setErrors({ users: "User already added" });
      return;
    }

    createGroupForm.setFieldValue("users", [...usersList, user._id]);
    setusers([...users, user]);
  };

  const deleteFromUsersList = (userToDelete) => {
    const newUsers = users.filter((u) => u._id !== userToDelete._id);
    setusers(newUsers);

    const usersIds = newUsers.map((u) => u._id);
    createGroupForm.setFieldValue("users", usersIds);

    console.log("newUsers", newUsers);
    console.log("usersIds", usersIds);
  };

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
      .then((res) => {
        console.log(res.data);
        setsearchUsersLoading(false);
        setsearchResult(res?.data?.results);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"lg"} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          fontSize={"35px"}
          fontFamily={"work sans"}
          textAlign={"center"}
        >
          Create Group Chat
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody display={"flex"} flexDir={"column"} alignItems={"center"}>
          <VStack spacing={"15px"} width={"100%"}>
            <form style={{ width: "100%" }}>
              <FormControl
                id="groupChatName"
                isRequired
                isInvalid={
                  createGroupForm.errors.chatName &&
                  createGroupForm.touched.chatName
                }
              >
                <Input
                  type="text"
                  name="chatName"
                  placeholder="Enter group chat name."
                  onChange={createGroupForm.handleChange}
                  onBlur={createGroupForm.handleBlur}
                  value={createGroupForm.values.chatName}
                />
                <FormErrorMessage>
                  {createGroupForm.errors.chatName}
                </FormErrorMessage>
              </FormControl>
            </form>

            <form style={{ width: "100%" }}>
              <FormControl
                id="name"
                isRequired
                isInvalid={
                  createGroupForm.errors.users ||
                  (searchUsersForm.errors.search &&
                    searchUsersForm.touched.search)
                }
              >
                <Input
                  type="text"
                  name="search"
                  onChange={searchUsersForm.handleChange}
                  onBlur={searchUsersForm.handleBlur}
                  value={searchUsersForm.values.search}
                  placeholder="Add Users ex: Ahmed, Eslam"
                  onKeyUp={searchUsersForm.handleSubmit}
                />
                <FormErrorMessage>
                  {searchUsersForm.errors.search ||
                    createGroupForm.errors.users}
                </FormErrorMessage>
              </FormControl>
            </form>

            {/* render selected users */}
            <HStack w={"100%"} flexWrap={"wrap"}>
              {users?.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  deleteBadge={() => deleteFromUsersList(user)}
                />
              ))}
            </HStack>

            {/* render search results */}
            {searchUsersLoading ? (
              <Button isLoading></Button>
            ) : (
              <Box overflowY={"scroll"} w={"100%"} maxH={"250px"}>
                {searchResult?.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    clickListItem={() => AddToUsersList(user)}
                  />
                ))}
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          {createGroupLoading ? (
            <Button isLoading></Button>
          ) : (
            <Button
              type="submit"
              colorScheme="blue"
              isDisabled={!(createGroupForm.dirty && createGroupForm.isValid)}
              onClick={createGroupForm.handleSubmit}
            >
              Create Chat
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
