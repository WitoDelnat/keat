import type { NextPage } from "next";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  router.push("/demo/rollouts");
  return null;
};

export default Home;
