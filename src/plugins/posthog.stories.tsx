import { PlayIcon, StopIcon } from "@radix-ui/react-icons";
import {
  Button,
  Center,
  Heading,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";
import React, { useMemo } from "react";
import { keatReact } from "../react/KeatReact";
import { posthog } from "./posthog";

type Props = {
  apiToken: string;
};

function PostHogDemo({ apiToken }: Props) {
  const { FeatureBoundary, variation } = useMemo(() => {
    return keatReact({
      plugins: [posthog(apiToken, { disable_session_recording: true })],
      features: { demo: false },
    });
  }, [apiToken]);

  return (
    <VStack width="100%">
      <VStack padding="6" alignItems="start" width="100%" spacing="3">
        <HStack>
          <Heading>PostHog</Heading>
        </HStack>
        <Text>Integrate your PostHog backend with Keat.</Text>

        <Button
          onClick={() => {
            console.log("TEST", variation("demo"));
            // identify({ id: 2, email: "wito.delnat@gmail.com" });
          }}
        >
          Identify
        </Button>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <Thead>
            <Tr>
              <Th>Feature</Th>
              <Th>Demo Element</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr key="demo">
              <Td>Demo</Td>
              <Td>
                <FeatureBoundary
                  name="demo"
                  fallback={<Fallback />}
                  invisible={<Invisible />}
                  display="optional"
                >
                  <Remote />
                </FeatureBoundary>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
}

function Invisible() {
  return (
    <Center
      borderRadius="md"
      color="gray"
      border="dashed"
      width="10"
      height="10"
    />
  );
}

function Fallback() {
  return (
    <Center
      borderRadius="md"
      color="red.600"
      border="solid"
      width="10"
      height="10"
    >
      <StopIcon />
    </Center>
  );
}

function Remote() {
  return (
    <Center
      borderRadius="md"
      color="green.600"
      border="solid"
      width="10"
      height="10"
    >
      <PlayIcon />
    </Center>
  );
}

/* * * * * * * * * * * * * *
 * Stories
 * * * * * * * * * * * * * */
const meta: Meta<typeof PostHogDemo> = {
  title: "Integrations/PostHog",
  component: PostHogDemo,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    apiToken: "phc_U3EnWiXJrzxIdkQCULBweP1O4yrLtwM1eEHIglSaGvn",
  },
};
