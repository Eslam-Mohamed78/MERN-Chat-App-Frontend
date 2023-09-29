import React from "react";
import {
  Box,
  Container,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import Login from "../components/auth/Login.js";
import Signup from "../components/auth/Signup.js";

export default function HomePage() {
  return (
    <Container maxW="xl" centerContent>
      <Box
        p={3}
        bg={"white"}
        w={"100%"}
        m={"40px 0 15px 0"}
        borderRadius={"lg"}
        borderWidth={"1px"}
        textAlign={"center"}
      >
        <Box display={"inline-block"} fontSize={"4xl"} fontFamily={"work sans"}>
          Welcome to&nbsp;
          <Text fontWeight={"bold"} display={"inline-block"} color="#2C7A7B">
            We-Chat
          </Text>
        </Box>
      </Box>

      <Box
        bg={"white"}
        w={"100%"}
        p={4}
        mt={"4"}
        borderRadius={"lg"}
        borderWidth={"1px"}
      >
        <Tabs variant="soft-rounded">
          <TabList mb={"1em"}>
            <Tab width={"50%"}>Login</Tab>
            <Tab width={"50%"}>Sign Up</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>

            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}
