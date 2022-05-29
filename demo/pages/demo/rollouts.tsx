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
import { randEmail } from "@ngneat/falso";
import { booleanFlag, keatReact, rollouts } from "keat";
import { NextPage } from "next";
import { useMemo } from "react";
import NavBar from "../../components/NavBar";

const COUNT = 1000;

export const { useKeat } = keatReact({
  plugins: [rollouts()],
  features: { demo: booleanFlag },
  config: { demo: 25 },
});

const RolloutsDemo: NextPage = () => {
  const { variation } = useKeat();

  const users = useMemo(() => {
    return Array.from(Array(COUNT).keys()).map((i) => {
      const email = randEmail();
      const user = { email };
      const enabled = variation("demo", user);
      return { key: i, email, enabled };
    });
  }, [variation]);

  const totalEnabled = useMemo(() => {
    return users.reduce((sum, user) => (user.enabled ? sum + 1 : sum), 0);
  }, [users]);

  return (
    <VStack width="100%" align="stretch">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Rollouts</Heading>
        <Text>
          Allows you to enable your features to a percentage of users. This demo
          uses a rule of 25%.
        </Text>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <TableCaption placement="top">
            1000 random users / 250 average enabled / {totalEnabled} actual
          </TableCaption>

          <Thead>
            <Tr>
              <Th>Number</Th>
              <Th>E-mail</Th>
              <Th>enabled</Th>
            </Tr>
          </Thead>

          <Tbody>
            {users.map((user) => {
              return (
                <Tr key={user.key}>
                  <Td>{user.key}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.enabled ? "enabled" : "disabled"}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};
export default RolloutsDemo;
