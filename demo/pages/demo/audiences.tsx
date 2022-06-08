import {
  Code,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { randEmail } from "@ngneat/falso";
import { audiences, keatReact } from "keat";
import { NextPage } from "next";
import { useMemo, useState } from "react";
import NavBar from "../../components/NavBar";

export const { useKeat } = keatReact({
  plugins: [
    audiences({
      staff: (user) => user?.email.endsWith("@example.io"),
    }),
  ],
  features: { demo: "staff" },
});

const AudiencesDemo: NextPage = () => {
  const { variation } = useKeat();
  const [customerEmail, setCustomerEmail] = useState(randEmail());
  const [staffEmail, setStaffEmail] = useState("jef@example.io");

  const customer = useMemo(() => {
    const enabled = variation("demo", { email: customerEmail });
    return { key: 1, email: customerEmail, enabled };
  }, [customerEmail, variation]);

  const staff = useMemo(() => {
    const enabled = variation("demo", { email: staffEmail });
    return { key: 1, email: staffEmail, enabled };
  }, [staffEmail, variation]);

  return (
    <VStack width="100%" alignItems="start" spacing="6">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Audiences</Heading>

        <FormControl maxWidth="lg">
          <FormLabel htmlFor="email">Customer Email</FormLabel>
          <Input
            id="email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </FormControl>

        <FormControl maxWidth="lg">
          <FormLabel htmlFor="email">Staff Email</FormLabel>
          <Input
            id="email"
            type="email"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Audience configuration</FormLabel>
          <Code>
            {
              'audiences({staff: (user) => user?.email.endsWith("@example.io")})'
            }
          </Code>
        </FormControl>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <TableCaption placement="top">
            2 users / 1 customer / 1 staff
          </TableCaption>

          <Thead>
            <Tr>
              <Th>Number</Th>
              <Th>E-mail</Th>
              <Th>enabled</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td>{customer.key}</Td>
              <Td>{customer.email}</Td>
              <Td>{customer.enabled ? "enabled" : "disabled"}</Td>
            </Tr>

            <Tr>
              <Td>{staff.key}</Td>
              <Td>{staff.email}</Td>
              <Td>{staff.enabled ? "enabled" : "disabled"}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};

export default AudiencesDemo;
