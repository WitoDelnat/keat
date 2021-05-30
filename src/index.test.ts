import * as faker from "faker";
import mockedFetch from "jest-fetch-mock";
import mockedFs from "mock-fs";
import { Keat } from "./index";
import { basicDefinitions, basicResources } from "./__fixtures__/index";

describe("Keat.create", () => {
  it("should initialise from given definitions", async () => {
    const keat = Keat.create({
      audiences: [
        {
          kind: "static",
          name: "developers",
          members: ["dev1", "dev2"],
        },
      ],
      features: [
        {
          name: "new-ui",
        },
        {
          name: "recommendations",
          audiences: ["developers"],
        },
      ],
    });

    assert(keat);
  });
});

describe("Keat.fromDefinitions", () => {
  it("should initialise from given definitions", async () => {
    const { definitions } = await basicDefinitions.execute();

    const keat = Keat.fromDefinitions({ definitions });

    assert(keat);
  });
});

describe("Keat.fromKeatServer", () => {
  it("should initialise from fetched definitions", async () => {
    const { definitions } = await basicDefinitions.execute();

    mockedFetch.mockResponses([JSON.stringify(definitions), { status: 200 }]);

    const keat = Keat.fromKeatServer();
    await keat.ready;
    await keat.engine.stop();

    assert(keat);
  });
});

describe("Keat.fromKubernetes", () => {
  beforeEach(() => {
    mockedFs({
      "/var/run/secrets/kubernetes.io/serviceaccount": {
        namespace: faker.random.word(),
        token: faker.random.word(),
        "ca.crt": faker.random.word(),
      },
    });
  });

  afterEach(() => {
    mockedFs.restore();
  });

  it("should initialise from fetched Kubernetes resources", async () => {
    const { audienceList, featureList } = await basicResources.execute();

    mockedFetch.mockResponses(
      [JSON.stringify(audienceList), { status: 200 }],
      [JSON.stringify(featureList), { status: 200 }]
    );

    const keat = await Keat.fromKubernetes();
    await keat.ready;
    await keat.engine.stop();

    assert(keat);
  });
});

function assert(keat: Keat) {
  expect(keat.isEnabled("new-ui")).toBe(true);
  expect(keat.isEnabled("new-ui", "usr1")).toBe(true);
  expect(keat.isEnabled("new-ui", "dev1")).toBe(true);

  expect(keat.isEnabled("recommendations")).toBe(false);
  expect(keat.isEnabled("recommendations", "usr1")).toBe(false);
  expect(keat.isEnabled("recommendations", "dev1")).toBe(true);
}
