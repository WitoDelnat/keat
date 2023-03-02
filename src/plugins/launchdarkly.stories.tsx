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
import { launchDarkly } from "./launchdarkly";

type Props = {
  clientId: string;
  userId: string;
  userEmail: string;
};

function LaunchDarklyDemo({ clientId, userId, userEmail }: Props) {
  const { FeatureBoundary, identify } = useMemo(() => {
    return keatReact({
      plugins: [launchDarkly(clientId)],
      features: { demo: false },
    });
  }, [clientId]);

  return (
    <VStack width="100%">
      <VStack padding="6" alignItems="start" width="100%" spacing="3">
        <HStack>
          <Heading>LaunchDarkly</Heading>
        </HStack>
        <Text>Integrate your LaunchDarkly backend with Keat.</Text>

        <Button
          onClick={() => {
            identify({ id: userId, email: userEmail });
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
const meta: Meta<typeof LaunchDarklyDemo> = {
  title: "Integrations/LaunchDarkly",
  component: LaunchDarklyDemo,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    clientId: "your-client-id",
    userId: "your-user-id",
    userEmail: "your-user-email",
  },
};
