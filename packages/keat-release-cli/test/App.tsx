import { useVariation } from "./features";

export const App = () => {
  const variation = useVariation();

  if (variation("feature-1")) {
    return <p>feature-1</p>;
  }

  if (variation("feature-2")) {
    const test = 3 + 2;
    return <p>{test}</p>;
  }

  return (
    <div>
      <h1>Keat Release</h1>

      <main>
        <p>My improved feature 3</p>

        <p>My existing code</p>
      </main>
    </div>
  );
};
