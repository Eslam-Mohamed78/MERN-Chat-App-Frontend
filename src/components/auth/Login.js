import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider.js";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [messageError, setmessageError] = useState("");
  const [isloading, setIsloading] = useState(false);
  const passwordRef = useRef();
  const emailRef = useRef();
  const toast = useToast();
  const navigate = useNavigate();
  const { decodeUserInfo } = ChatState();

  // show & hide toggle button
  const handlePassword = () => {
    setShowPassword(!showPassword);
  };

  // fill inputs with guest login data
  function handleGuest() {
    formik.setFieldValue("email", "guest@example.com");
    formik.setFieldValue("password", "A1234");
    emailRef.current.value = "guest@example.com";
    passwordRef.current.value = "A1234";
  }

  // yup validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Email is required")
      .email("InValid Email Address"),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^[A-Z][a-z0-9]{4,10}$/,
        "Must start with uppercase & length (5:10) & no special characters"
      ),
  });

  // submit data to backend
  async function handleLogin(values) {
    setIsloading(true);

    await axios
      .post(`${process.env.REACT_APP_BASE_URL}/auth/login`, values)
      .then(async (res) => {
        setIsloading(false);
        toast({
          description: "Logged In Successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        // make sure errorMessage state is empty
        setmessageError(null);

        // save user info then redirect him
        localStorage.setItem("mern-chat-app", `${res.data.results}`);
        await decodeUserInfo();
        navigate("/chats");
      })
      .catch((error) => {
        setIsloading(false);
        setmessageError("Oops! something went wrong, try again.");
        console.log("Error message: ", error);
      });
  }

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: handleLogin,
    validationSchema,
  });

  return (
    <>
      {messageError ? (
        <Text fontSize="25px" color="red">
          {messageError}
        </Text>
      ) : null}

      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={"15px"}>
          <FormControl
            id="loginEmail"
            isRequired
            isInvalid={formik.errors.email && formik.touched.email}
          >
            <FormLabel>Email</FormLabel>
            <Input
              ref={emailRef}
              type="email"
              name="email"
              placeholder="Enter Your Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />

            <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl
            id="loginPassword"
            isRequired
            isInvalid={formik.errors.password && formik.touched.password}
          >
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Your Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />

              <InputRightElement width={"4.5rem"}>
                <Button h={"1.75rem"} size={"sm"} onClick={handlePassword}>
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>

            <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
          </FormControl>

          {isloading ? (
            <Button
              isLoading
              colorScheme="blue"
              width={"100%"}
              mt={15}
            ></Button>
          ) : (
            <Button
              type="submit"
              isDisabled={!(formik.dirty && formik.isValid)}
              colorScheme="blue"
              width={"100%"}
              mt={15}
            >
              Login
            </Button>
          )}

          {isloading ? (
            <Button
              isLoading
              colorScheme="blue"
              width={"100%"}
              mt={15}
            ></Button>
          ) : (
            <Button
              type="submit"
              colorScheme="red"
              width={"100%"}
              mt={15}
              onClick={handleGuest}
            >
              Get Guest User Credentials
            </Button>
          )}
        </VStack>
      </form>
    </>
  );
}
