import React, { useState } from "react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  HStack,
  Input,
  List,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import ChatLoading from "../Chat/ChatLoading.js";
import UserListItem from "./UserListItem.js";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider.js";

export default function SideDrawer({ isOpen, onClose }) {
  const [isloading, setisloading] = useState(false);
  const [loadingChat, setloadingChat] = useState(true);
  const [searchResult, setsearchResult] = useState(null);
  const { setSelectedChat, chats, setChats, reloadChats, setreloadChats } =
    ChatState();
  const toast = useToast();

  // Only the validation needed is required() / because user doesn't
  // need to enter the full name or all email to get the result.
  const validationSchema = Yup.object({
    search: Yup.string().required("UserName or Email is required"),
    // .test("test-name", "Enter Valid Name or Email", function (value) {
    //   if (value) {
    //     return value.includes("@")
    //       ? Yup.string().email("InValid Email Address").isValidSync(value)
    //       : Yup.string()
    //           .min(3, "Name minLength is 3")
    //           .max(20, "Name maxLength is 20")
    //           .isValidSync(value);
    //   }
    //   return false;
    // }),
  });

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

  const handleSubmit = async (values) => {
    setisloading(true);

    await axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/user?search=${values.search}`,
        config
      )
      .then((res) => {
        console.log(res.data);
        setisloading(false);
        setsearchResult(res?.data?.results);
      })
      .catch((error) => {
        console.error(error);
        setisloading(false);
        toast({
          description: "Failed to load the search results!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  const formik = useFormik({
    initialValues: {
      search: "",
    },
    onSubmit: handleSubmit,
    validationSchema,
  });

  // accessChat for result item
  const accessChat = async (partnerId) => {
    setisloading(true);

    const data = {
      partnerId,
    };

    await axios
      .post(`${process.env.REACT_APP_BASE_URL}/chat`, data, config)
      .then((res) => {
        console.log("accessChat:", res.data);
        setisloading(false);

        // add this chat to the chats state if not in it
        // because if it is a <<new created>> chat will not be
        // in the logged user chats.
        if (!chats) setChats(res.data.results);

        for (const chat of chats) {
          const currChat = res.data.results;
          if (chat._id !== currChat._id) {
            setChats([...chats, currChat]);
          }
        }

        setreloadChats(!reloadChats);
        setSelectedChat(res.data.results);
        setloadingChat(false);
        onClose();
      })
      .catch((error) => {
        console.error(error);
        setisloading(false);
        toast({
          description: "Failed to load the chat!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      });
  };

  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth={1} pb={2}>
          Search Users
        </DrawerHeader>

        <DrawerBody>
          <form onSubmit={formik.handleSubmit} style={{ marginBottom: "15px" }}>
            <HStack alignItems={"flex-start"}>
              <FormControl
                id="name"
                isRequired
                isInvalid={formik.errors.search && formik.touched.search}
              >
                <Input
                  type="text"
                  name="search"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.search}
                  placeholder="Search by name or email"
                />
                <FormErrorMessage>{formik.errors.search}</FormErrorMessage>
              </FormControl>

              {isloading ? (
                <Button isLoading></Button>
              ) : (
                <Button
                  type="submit"
                  isDisabled={!(formik.dirty && formik.isValid)}
                >
                  Go
                </Button>
              )}
            </HStack>
          </form>

          {isloading ? (
            <ChatLoading />
          ) : (
            <List>
              {searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  clickListItem={() => accessChat(user._id)}
                />
              ))}
            </List>
          )}
        </DrawerBody>

        <DrawerFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
