import {
  Heading,
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
import { keatReact, timeInterval } from "keat";
import { NextPage } from "next";
import NavBar from "../../components/NavBar";

const DATE = "2022-11-15T21:05/2022-11-15T21:10";

export const { useKeat, useVariation } = keatReact({
  features: { demo: DATE },
  plugins: [timeInterval()],
});

const ScheduleDemo: NextPage = () => {
  const variation = useVariation();

  return (
    <VStack width="100%" alignItems="start" spacing="6">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Time interval</Heading>
        <Text>Enable a feature when it is in a given time interval.</Text>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <TableCaption placement="top">
            2 users / 1 customer / 1 staff
          </TableCaption>

          <Thead>
            <Tr>
              <Th>Number</Th>
              <Th>Date</Th>
              <Th>Enabled?</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td>1</Td>
              <Td>{DATE}</Td>
              <Td>{JSON.stringify(variation("demo"))}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};

export default ScheduleDemo;
