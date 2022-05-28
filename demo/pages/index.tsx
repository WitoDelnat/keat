import type { NextPage } from "next";
import { useRouter } from "next/router";

declare module "keat" {
  interface CustomTypes {
    user: {
      id: string;
      email: string;
      earlyPreview: boolean;
    };
  }
}

const Home: NextPage = () => {
  const router = useRouter();
  router.push("/demo/rollouts");
  return null;
};

export default Home;
