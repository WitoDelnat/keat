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
import { keatReact, localStorage, queryParam } from "keat";
import { NextPage } from "next";
import NavBar from "../../components/NavBar";

export const { useKeat, useVariation } = keatReact({
  features: { localstoragedemo: "foo", queryparamdemo: "bar" },
  plugins: [localStorage("foo"), queryParam("bar", { value: "5" })],
});

const Demo: NextPage = () => {
  const variation = useVariation();

  return (
    <VStack width="100%" alignItems="start" spacing="6">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Miscellaneous</Heading>
        <Text>
          Enable a feature when it has a query parameter or local storage item.
        </Text>
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
              <Td>{window.localStorage.getItem("foo")}</Td>
              <Td>{JSON.stringify(variation("localstoragedemo"))}</Td>
            </Tr>
            <Tr>
              <Td>2</Td>
              <Td>{window.location.search}</Td>
              <Td>{JSON.stringify(variation("queryparamdemo"))}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};

export default Demo;
