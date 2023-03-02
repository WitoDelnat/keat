import React, { useMemo } from "react";
import { keatReact } from "../react/KeatReact";
import { rollouts } from "./rollouts";
import { randEmail } from "@ngneat/falso";
import {
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Meta, StoryObj } from "@storybook/react";

const COUNT: number = 1000;

const { useVariation, configure } = keatReact({
  plugins: [rollouts()],
  features: { demo: 25 },
});

type Props = {
  percentage: number;
};

const Rollouts = ({ percentage }: Props) => {
  const variation = useVariation();

  const { users, totalEnabled } = useMemo(() => {
    configure({ demo: percentage });

    const users = Array.from(Array(COUNT).keys()).map((i) => {
      const email = randEmail();
      const user = { email };
      const enabled = variation("demo", user);
      return { key: i, email, enabled };
    });

    const totalEnabled = users.reduce(
      (sum, user) => (user.enabled ? sum + 1 : sum),
      0
    );
    return { users, totalEnabled };
  }, [variation, configure, percentage]);

  return (
    <VStack width="100%" align="stretch">
      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Rollouts</Heading>
        <Text>
          Allows you to enable your features to a percentage of users.
        </Text>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <TableCaption placement="top">
            {COUNT} random users / {Math.floor(COUNT * percentage) / 100}{" "}
            average enabled / {totalEnabled} actual
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

/* * * * * * * * * * * * * *
 * Stories
 * * * * * * * * * * * * * */
const meta: Meta<typeof Rollouts> = {
  title: "Example/Rollouts",
  component: Rollouts,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    percentage: 5,
  },
};
