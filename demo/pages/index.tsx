import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { useKeat } from "../utils/features";

const Home: NextPage = () => {
  const { loading } = useKeat("block");
  const [count, setCount] = useState(0);

  console.log("WITO", loading);
  useEffect(() => {
    const timer = setTimeout(() => setCount(count + 1), 1000);
    return () => clearTimeout(timer);
  }, [count, setCount]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Keat Demo</title>
        <meta name="description" content="Keat demo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p>Keat demo</p>

        <p>
          Page has been open for <code>{count}</code> seconds.
        </p>

        {/* <div>
          <FeatureBoundary name="search" display="swap">
            <p>OK search is enabled</p>
          </FeatureBoundary>

          <FeatureBoundary
            name="redesign"
            display="fallback"
            invisible={<p>redesign invisible</p>}
            fallback={<p>redesign is disabled</p>}
          >
            <p>OK redesign is enabled</p>
          </FeatureBoundary>

          <FeatureBoundary
            name="chatbot"
            display="optional"
            invisible={<p>chatbot invisible</p>}
            fallback={<p>OK chatbot is disabled</p>}
          >
            <p>chatbot is enabled</p>
          </FeatureBoundary>
        </div> */}
      </main>
    </div>
  );
};

export default Home;
