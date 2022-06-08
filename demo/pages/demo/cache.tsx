import {
  Button,
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
import { anonymous, cache, keatReact, rollouts } from "keat";
import { NextPage } from "next";
import { useCallback, useState } from "react";
import NavBar from "../../components/NavBar";

const COUNT = 500_000;

export const { useKeat: useCachedKeat } = keatReact({
  plugins: [anonymous(), cache(), rollouts()],
  features: { demo: 50 },
});

export const { useKeat: useUncachedKeat } = keatReact({
  plugins: [anonymous(), rollouts()],
  features: { demo: 50 },
});

const CacheDemo: NextPage = () => {
  const uncachedKeat = useUncachedKeat();
  const cachedKeat = useCachedKeat();
  const [result, setResult] = useState<any>(null);

  const run = useCallback(() => {
    const startUncached = performance.now();
    for (const _ of Array(COUNT)) {
      uncachedKeat.variation("demo");
    }
    const uncachedDuration = performance.now() - startUncached;

    const startCached = performance.now();
    for (const _ of Array(COUNT)) {
      cachedKeat.variation("demo");
    }
    const cachedDuration = performance.now() - startCached;

    setResult([
      { key: 1, isCached: false, duration: uncachedDuration },
      { key: 2, isCached: true, duration: cachedDuration },
    ]);
  }, [cachedKeat, uncachedKeat]);

  return (
    <VStack width="100%" alignItems="start" spacing="6">
      <NavBar />

      <VStack padding="6" alignItems="start" width="100%" spacing="6">
        <Heading>Cache</Heading>
        <Text>
          Adds simple caching to your evaluations which improve performance.
        </Text>

        <Button onClick={run}>Run experiment</Button>
      </VStack>

      <TableContainer width="100%">
        <Table variant="striped" colorScheme="orange">
          <TableCaption placement="top">
            1 user / {COUNT} evaluations / basic rollout
          </TableCaption>

          <Thead>
            <Tr>
              <Th>Number</Th>
              <Th>Strategy</Th>
              <Th>Duration (ms)</Th>
            </Tr>
          </Thead>

          <Tbody>
            {!result ? (
              <Tr>
                <Td>loading...</Td>
                <Td />
                <Td />
              </Tr>
            ) : (
              <>
                <Tr>
                  <Td>{result[0].key}</Td>
                  <Td>{result[0].isCached ? "Cached" : "No cache"}</Td>
                  <Td>{result[0].duration}</Td>
                </Tr>

                <Tr>
                  <Td>{result[1].key}</Td>
                  <Td>{result[1].isCached ? "Cached" : "No cache"}</Td>
                  <Td>{result[1].duration}</Td>
                </Tr>
              </>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
};

export default CacheDemo;
