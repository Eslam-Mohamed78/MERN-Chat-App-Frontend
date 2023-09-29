import React, { useState } from "react";
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

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isloading, setIsloading] = useState(false);
  const [messageError, setmessageError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  // show & hide toggle button
  const handlePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // yup validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Name is required")
      .min(3, "Name minLength is 3")
      .max(20, "Name maxLength is 20"),
    email: Yup.string()
      .required("Email is required")
      .email("InValid Email Address"),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^[A-Z][a-z0-9]{4,10}$/,
        "Must start with uppercase & length (5:10) & no special characters"
      ),
    cPassword: Yup.string()
      .required("Confirm password is required")
      .oneOf(
        [Yup.ref("password")],
        "password & confirm password doesn't match"
      ),
  });

  // submit data to backend
  async function handleRegister(values) {
    setIsloading(true);

    // make FormData to send values
    const formData = new FormData();
    for (const value in values) {
      // skip if no picture
      if (value === "profilePic" && values[value] === "") continue;
      formData.append(value, values[value]);
    }

    // send request
    await axios
      .post(`${process.env.REACT_APP_BASE_URL}/auth/`, formData)
      .then((res) => {
        setIsloading(false);

        console.log(res.data);
        toast({
          description: "User Created Successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });

        navigate("/chats");
        // make sure errorMessage state is empty
        setmessageError(null);
      })
      .catch((error) => {
        setIsloading(false);
        setmessageError("Oops! something went wrong, try again.");
        console.log("Error message: ", error.response.data.message);
      });
  }

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      cPassword: "",
      profilePic: "",
    },
    onSubmit: handleRegister,
    validationSchema,
  });

  return (
    <>
      {messageError ? (
        <Text fontSize="25px" color="red">
          {messageError}
        </Text>
      ) : null}

      <form encType="multipart/form-data" onSubmit={formik.handleSubmit}>
        <VStack spacing={"15px"}>
          <FormControl
            id="name"
            isRequired
            isInvalid={formik.errors.name && formik.touched.name}
          >
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              placeholder="Enter Your Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl
            id="email"
            isRequired
            isInvalid={formik.errors.email && formik.touched.email}
          >
            <FormLabel>Email</FormLabel>
            <Input
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
            id="password"
            isRequired
            isInvalid={formik.errors.password && formik.touched.password}
          >
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
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

          <FormControl
            id="cPassword"
            isRequired
            isInvalid={formik.errors.cPassword && formik.touched.cPassword}
          >
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="cPassword"
                placeholder="Confirm Your Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.cPassword}
              />

              <InputRightElement width={"4.5rem"}>
                <Button
                  h={"1.75rem"}
                  size={"sm"}
                  onClick={handleConfirmPassword}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>

            <FormErrorMessage>{formik.errors.cPassword}</FormErrorMessage>
          </FormControl>

          <FormControl id="profilePic">
            <FormLabel>Upload Your Picture</FormLabel>
            <Input
              type="file"
              name="profilePic"
              placeholder="Enter a profile picture"
              onChange={(e) => {
                // console.log(e.currentTarget.files[0]);
                formik.setFieldValue("profilePic", e.currentTarget.files[0]);
              }}
              p={1.5}
              accept="image/*"
            />
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
              Sign Up
            </Button>
          )}
        </VStack>
      </form>
    </>
  );
}
