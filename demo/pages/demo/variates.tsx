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
import { audiences, ExtractFeatures, keatReact } from "keat";
import { NextPage } from "next";
import NavBar from "../../components/NavBar";

type Feature = ExtractFeatures<typeof keat>;

export const keat = keatReact({
  plugins: [
    audiences({
      staff: (user) => user?.email.endsWith("@example.io"),
    }),
  ],
  features: {
    featureDefault: true,
    featureBiVariates: {
      variates: ["variate-1", "variate-2"],
      when: true,
    },
    featureMultiStringVariates: {
      variates: ["variate-1", "variate-2", "variate-3"],
      when: [false, true, false],
    },
    featureMultiNumberVariates: {
      variates: [100, 200, 1000],
      when: [true, false, false],
    },
    featureMultiObjectVariates: {
      variates: [
        { type: "default" },
        { type: "batched", batchSize: 100 },
        { type: "batched", batchSize: 1 },
      ],
      when: [{ OR: [20, "staff"] }, 30],
    },
  } as const,
});

const { useKeat } = keat;

const features: Feature[] = [
  "featureDefault",
  "featureBiVariates",
  "featureMultiStringVariates",
  "featureMultiNumberVariates",
  "featureMultiObjectVariates",
];

const VariatesDemo: NextPage = () => {
  const { variation } = useKeat();

  return (
    <VStack width="100%" alignItems="start" spacing="6">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Bi- and multi-variates</Heading>

        <Text>
          Use variates of any type and quantity instead of limiting yourself
          with boolean flags.
        </Text>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <TableCaption placement="top">
            Custom bi- and multi-variates
          </TableCaption>

          <Thead>
            <Tr>
              <Th>Number</Th>
              <Th>Feature</Th>
              <Th>Result</Th>
              <Th>Type</Th>
            </Tr>
          </Thead>

          <Tbody>
            {features.map((feature, key) => {
              return (
                <Tr key={key}>
                  <Td>{key}</Td>
                  <Td>{feature}</Td>
                  <Td>
                    <code>{JSON.stringify(variation(feature as any))}</code>
                  </Td>
                  <Td>{typeof variation(feature as any)}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};

export default VariatesDemo;
