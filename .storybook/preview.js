import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

export const parameters = {
  backgrounds: {
    default: "light",
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => {
    return (
      <ChakraProvider>
        <Story />
      </ChakraProvider>
    );
  },
];
