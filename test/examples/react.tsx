import React from "react";
import { ExtractFeatures, keatReact, remoteConfig } from "../../src";
import { Search, SearchSkeleton, SortedList } from "./components";

type Feature = ExtractFeatures<typeof keat>;

const keat = keatReact({
  features: {
    redesign: true,
    search: true,
    sortAlgorithm: {
      variates: ["quicksort", "heapsort"],
    },
  } as const,
  plugins: [remoteConfig("https://example.io/config")],
});

const { useKeat, FeatureBoundary } = keat;

export function App() {
  const { variation } = useKeat();

  return (
    <div>
      <h1>Keat</h1>

      <FeatureBoundary
        name="redesign"
        display="optional"
        fallback={<p>Your old design</p>}
      >
        <p>Your new design</p>
      </FeatureBoundary>

      <FeatureBoundary
        name="search"
        display="block"
        invisible={<SearchSkeleton />}
      >
        <Search />
      </FeatureBoundary>

      <SortedList data={[1, 3, 4]} algorithm={variation("sortAlgorithm")} />
    </div>
  );
}
