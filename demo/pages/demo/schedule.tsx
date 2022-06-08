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
import { keatReact, schedule } from "keat";
import { NextPage } from "next";
import NavBar from "../../components/NavBar";

const DATE = "2022-05-07";

export const { useKeat } = keatReact({
  plugins: [schedule()],
  features: { demo: DATE } as const,
});

const ScheduleDemo: NextPage = () => {
  const { variation } = useKeat();

  return (
    <VStack width="100%" alignItems="start" spacing="6">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Schedule</Heading>
        <Text>Enable a feature once a certain date has passed.</Text>
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
