import React, { useEffect, useState } from 'react';
import './App.css';
import { FeatureBoundary, useKeat } from './features';

interface AppProps {}

function App({}: AppProps) {
  const { loading } = useKeat();
  const [count, setCount] = useState(0);
  console.log('loading', loading);

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
          <FeatureBoundary name="search" display="swap">
            <p>OK 'search' is enabled</p>
          </FeatureBoundary>

          <FeatureBoundary
            name="redesign"
            display="fallback"
            invisible={<p>redesign invisible</p>}
            fallback={<p>'redesign' is disabled</p>}
          >
            <p>OK 'redesign' is enabled</p>
          </FeatureBoundary>

          <FeatureBoundary
            name="chatbot"
            display="optional"
            invisible={<p>chatbot invisible</p>}
            fallback={<p>OK 'chatbot' is disabled</p>}
          >
            <p>'chatbot' is enabled</p>
          </FeatureBoundary>
        </div>
      </header>
    </div>
  );
}

export default App;
