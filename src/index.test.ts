import mockedFetch from "jest-fetch-mock";
import fetch from "node-fetch";
import { Keat } from ".";

describe("Keat", () => {
  it("should determine whether a feature is enabled", () => {
    const keat = Keat.create({
      audiences: {
        developers: (user) => (user ? ["dev1", "dev2"].includes(user) : false),
        staff: (user) => user?.includes("@example.com") ?? false,
      },
      features: {
        redesign: "developers",
        recommendations: "everyone",
      },
    });

    expect(keat.isEnabled("redesign")).toBe(false);
    expect(keat.isEnabled("recommendations")).toBe(true);
    expect(keat.isEnabled("redesign", "dev1")).toBe(true);
    expect(keat.isEnabled("recommendations", "dev1")).toBe(true);
    expect(keat.isEnabled("redesign", "usr1")).toBe(false);
    expect(keat.isEnabled("recommendations", "usr2")).toBe(true);
  });

  it("should determine all enabled features for a given user", () => {
    const keat = Keat.create({
      audiences: {
        developers: (user) => (user ? ["dev1", "dev2"].includes(user) : false),
      },
      features: {
        redesign: "developers",
        recommendations: "everyone",
      },
    });

    const devSnapshot = keat.snapshot("dev1");
    expect(devSnapshot.recommendations).toBe(true);
    expect(devSnapshot.redesign).toBe(true);
    const usrSnapshot = keat.snapshot("usr1");
    expect(usrSnapshot.recommendations).toBe(true);
    expect(usrSnapshot.redesign).toBe(false);
  });
});

describe("Keat.remoteConfig", () => {
  it("should work with custom remote configuration", async () => {
    const remoteConfig = { test: "everyone" };
    mockedFetch.mockResponses([JSON.stringify(remoteConfig), { status: 200 }]);

    const keat = Keat.create({
      features: {
        test: "nobody",
      },
      remoteConfig: {
        kind: "poll",
        fetch: async () => {
          const response = await fetch("http://localhost:8080/config.json");
          if (!response.ok) throw new Error("request failed");
          return await response.json();
        },
      },
    });

    await keat.ready;

    expect(keat.isEnabled("test")).toBe(true);

    await keat.stop();
  });
});
