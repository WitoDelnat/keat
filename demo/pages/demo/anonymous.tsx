import {
  Code,
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
import { anonymous, booleanFlag, keatReact, rollouts } from "keat";
import { NextPage } from "next";
import { useLocalstorageState } from "rooks";
import NavBar from "../../components/NavBar";

export const { useKeat } = keatReact({
  plugins: [anonymous(), rollouts()],
  features: { demo: booleanFlag },
  config: { demo: 50 },
});

const AnonymousDemo: NextPage = () => {
  const { variation } = useKeat();
  const enabled = variation("demo");
  const [id, _] = useLocalstorageState<string | undefined>("__keat_aid");
  const user = { key: 1, id, enabled };

  return (
    <VStack width="100%" alignItems="start" spacing="6">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Anonymous</Heading>
        <Text>
          Adds a generated, stable identity, which allows reliable rollouts. Can
          be persisted across sessions.
        </Text>

        <Code>{id ?? "undefined"}</Code>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <TableCaption placement="top">
            1 anonymous user / 50% chance to be enabled / persisted in local
            storage
          </TableCaption>

          <Thead>
            <Tr>
              <Th>Number</Th>
              <Th>Identifier</Th>
              <Th>enabled</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td>{user.key}</Td>
              <Td>{user.id}</Td>
              <Td>{user.enabled ? "enabled" : "disabled"}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};

export default AnonymousDemo;
