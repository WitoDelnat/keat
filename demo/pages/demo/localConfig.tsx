import {
  Code,
  FormControl,
  FormLabel,
  Heading,
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
import { fromEnv, keatReact, localConfig } from "keat";
import { NextPage } from "next";
import NavBar from "../../components/NavBar";
import featuresJson from "../features.json";

export const { useKeat } = keatReact({
  plugins: [
    localConfig({
      ...featuresJson,
      demoEnv: fromEnv(process.env["NEXT_PUBLIC_TOGGLE_DEMO"]),
    }),
  ],
  features: {
    demoJson: false,
    demoEnv: false,
  } as const,
});

const EnvConfigDemo: NextPage = () => {
  const { variation } = useKeat();

  return (
    <VStack width="100%" alignItems="start" spacing="6">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Local config</Heading>

        <Text>
          Use a JSON file or environment variables to toggle your feature flags.
        </Text>

        <FormControl>
          <FormLabel>JSON content</FormLabel>
          <Code>{JSON.stringify(featuresJson)}</Code>
        </FormControl>

        <FormControl>
          <FormLabel>NEXT_PUBLIC_TOGGLE_DEMO env value</FormLabel>
          <Code>{JSON.stringify(process.env["NEXT_PUBLIC_TOGGLE_DEMO"])}</Code>
        </FormControl>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <Thead>
            <Tr>
              <Th>Number</Th>
              <Th>Name</Th>
              <Th>Default</Th>
              <Th>Enabled?</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td>1</Td>
              <Td>demoJson</Td>
              <Td>false</Td>
              <Td>{JSON.stringify(variation("demoJson"))}</Td>
            </Tr>

            <Tr>
              <Td>2</Td>
              <Td>demoEnv</Td>
              <Td>false</Td>
              <Td>{JSON.stringify(variation("demoEnv"))}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};

export default EnvConfigDemo;
