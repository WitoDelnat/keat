import React from "react";
import { booleanFlag, KeatReact, useRemoteConfig } from "keat";
import { Search, SearchSkeleton, SortedList } from "./components";

const { useKeat, FeatureBoundary } = KeatReact.create({
  features: {
    redesign: booleanFlag,
    search: booleanFlag,
    sortAlgorithm: ["quicksort", "heapsort"],
  } as const,
  plugins: [useRemoteConfig("https://example.io/config")],
});

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
