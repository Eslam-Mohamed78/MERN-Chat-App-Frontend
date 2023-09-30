import React from "react";
import { ViewIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  useDisclosure,
  ModalBody,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider.js";

export default function ProfileModal({ children, user }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userInfo } = ChatState();

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}

      <Modal size={"lg"} isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent h={"410px"}>
          <ModalHeader
            fontSize={"40px"}
            fontFamily={"Work sans"}
            display={"flex"}
            justifyContent={"center"}
          >
            {user ? user.name : userInfo.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack>
              <Image
                borderRadius={"full"}
                boxSize={"150px"}
                src={user ? user.pic.url : userInfo.pic.url}
                alt={userInfo.name}
              />
              <Text
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily={"Work sans"}
              >
                Email: {user ? user.email : userInfo.email}
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
