import mockedFetch from "jest-fetch-mock";
import fetch from "node-fetch";
import { Keat } from ".";

describe("Keat", () => {
  it("should determine whether a feature is enabled", () => {
    const keat = Keat.create({
      audiences: [
        {
          name: "developers",
          includes: (user) => (user ? ["dev1", "dev2"].includes(user) : false),
        },
        {
          name: "company-example",
          includes: (user) => user?.includes("@example.com") ?? false,
        },
      ],
      features: [
        {
          name: "new-ui",
          audience: "developers",
        },
        {
          name: "recommendations",
          audience: "everyone",
        },
      ],
    });

    expect(keat.isEnabled("new-ui")).toBe(false);
    expect(keat.isEnabled("recommendations")).toBe(true);
    expect(keat.isEnabled("new-ui", "dev1")).toBe(true);
    expect(keat.isEnabled("recommendations", "dev1")).toBe(true);
    expect(keat.isEnabled("new-ui", "usr1")).toBe(false);
    expect(keat.isEnabled("recommendations", "usr2")).toBe(true);
  });

  it("should determine all enabled features for a given user", () => {
    const keat = Keat.create({
      audiences: [
        {
          name: "developers",
          includes: (user) => (user ? ["dev1", "dev2"].includes(user) : false),
        },
      ],
      features: [
        {
          name: "new-ui",
          audience: "developers",
        },
        {
          name: "recommendations",
          audience: "everyone",
        },
      ],
    });

    expect(keat.getFeaturesFor("dev1")).toEqual(["new-ui", "recommendations"]);
    expect(keat.getFeaturesFor("usr1")).toEqual(["recommendations"]);
  });
});

describe("Keat.remoteConfig", () => {
  it("should work with custom remote configuration", async () => {
    const remoteConfig = { test: "everyone" };
    mockedFetch.mockResponses([JSON.stringify(remoteConfig), { status: 200 }]);

    const keat = Keat.create({
      features: [
        {
          name: "test",
          audience: "nobody",
        },
      ],
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
