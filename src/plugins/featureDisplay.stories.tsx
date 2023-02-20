import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Button,
  Center,
  Heading,
  HStack,
  Table,
  TableCaption,
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
import React, { useCallback, useState } from "react";
import { useIntervalWhen } from "rooks";
import { keatReact } from "../react/KeatReact";
import { customConfig } from "./customConfig";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const createKeat = (ms: number) =>
  keatReact({
    plugins: [
      customConfig({ fetch: () => pause(ms).then(() => ({ demo: true })) }),
    ],
    features: { demo: false },
  });

function RemoteDemo() {
  const [value, setValue] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);
  const [rows, setRows] = useState([
    { delay: 70, FeatureBoundary: createKeat(70).FeatureBoundary },
    { delay: 150, FeatureBoundary: createKeat(150).FeatureBoundary },
    { delay: 2000, FeatureBoundary: createKeat(2000).FeatureBoundary },
    { delay: 4000, FeatureBoundary: createKeat(4000).FeatureBoundary },
  ]);

  const handlRestart = useCallback(() => {
    setValue(0);
    setDisplayValue(0);
    setRows([
      { delay: 70, FeatureBoundary: createKeat(70).FeatureBoundary },
      { delay: 150, FeatureBoundary: createKeat(150).FeatureBoundary },
      { delay: 2000, FeatureBoundary: createKeat(2000).FeatureBoundary },
      { delay: 4000, FeatureBoundary: createKeat(4000).FeatureBoundary },
    ]);
  }, [setValue, setRows]);

  useIntervalWhen(() => setValue(value + 50), 50);
  useIntervalWhen(() => setDisplayValue(displayValue + 250), 250);

  return (
    <VStack width="100%">
      <VStack padding="6" alignItems="start" width="100%" spacing="3">
        <HStack>
          <Heading>Feature Display</Heading>
          <Button onClick={handlRestart}>Restart</Button>;
        </HStack>
        <Text>
          You can optimize individual boundaries instead of blocking your whole
          application due to slow remote configuration endpoint.
        </Text>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <TableCaption placement="top">
            Feature displays / {displayValue} ms passed
          </TableCaption>

          <Thead>
            <Tr>
              <Th>Delay (ms)</Th>
              <Th>Block</Th>
              <Th>Swap</Th>
              <Th>Fallback</Th>
              <Th>Optional</Th>
            </Tr>
          </Thead>

          <Tbody>
            {rows.map(({ delay, FeatureBoundary }) => (
              <Tr key={delay}>
                <Td>{delay}</Td>
                <Td>
                  <FeatureBoundary
                    name="demo"
                    display="block"
                    invisible={<Invisible />}
                    fallback={<Fallback />}
                  >
                    <Remote />
                  </FeatureBoundary>
                </Td>
                <Td>
                  <FeatureBoundary
                    name="demo"
                    display="swap"
                    invisible={<Invisible />}
                    fallback={<Fallback />}
                  >
                    <Remote />
                  </FeatureBoundary>
                </Td>
                <Td>
                  <FeatureBoundary
                    name="demo"
                    display="fallback"
                    invisible={<Invisible />}
                    fallback={<Fallback />}
                  >
                    <Remote />
                  </FeatureBoundary>
                </Td>
                <Td>
                  <FeatureBoundary
                    name="demo"
                    display="optional"
                    invisible={<Invisible />}
                    fallback={<Fallback />}
                  >
                    <Remote />
                  </FeatureBoundary>
                </Td>
              </Tr>
            ))}
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
      <WarningIcon />
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
      <CheckCircleIcon />
    </Center>
  );
}

/* * * * * * * * * * * * * *
 * Stories
 * * * * * * * * * * * * * */
const meta: Meta<typeof RemoteDemo> = {
  title: "Features/Display",
  component: RemoteDemo,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
