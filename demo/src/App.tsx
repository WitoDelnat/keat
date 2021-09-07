import React, { useEffect, useState } from 'react';
import './App.css';
import { FeatureFlag } from './features';

interface AppProps {}

function App({}: AppProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setCount(count + 1), 1000);
    return () => clearTimeout(timer);
  }, [count, setCount]);

  return (
    <div className="App">
      <header className="App-header">
        <p>Keat demo</p>

        <p>
          Page has been open for <code>{count}</code> seconds.
        </p>

        <div>
          <FeatureFlag name="search">
            <p>'search' is enabled</p>
          </FeatureFlag>

          <FeatureFlag name="chatbot">
            <p>'chatbot' is enabled</p>
          </FeatureFlag>

          <FeatureFlag name="redesign">
            <p>'redesign' is enabled</p>
          </FeatureFlag>
        </div>
      </header>
    </div>
  );
}

export default App;
