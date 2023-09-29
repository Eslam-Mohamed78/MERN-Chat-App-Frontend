import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import ChatProvider from "./Context/ChatProvider.js";
import HomePage from "./pages/HomePage.js";
import ChatPage from "./pages/ChatPage.js";

export default function App() {
  // protected routing (check login)
  function ProtectedRoute({ children }) {
    if (!localStorage.getItem("mern-chat-app")) {
      return <Navigate to={"/"} />;
    }
    return <ChatPage />;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/chats",
      element: (
        <ProtectedRoute>
          <ChatPage />
        </ProtectedRoute>
      ),
    },
  ]);

  return (
    <ChatProvider>
      <ChakraProvider>
        <RouterProvider router={router} />
      </ChakraProvider>
    </ChatProvider>
  );
}
