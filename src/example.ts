const keat = new Keat({
  audiences: {
    preview: (user) => user?.earlyPreview ?? false,
    staff: (user) => user.email.includes("@example.com") ?? false,
  },
  features: [
    { name: "test" },
    { name: "redesign" },
    { name: "redesign-left", variants: [true, false] },
    { name: "algo", variants: ["heuristic", "brute", "basic"] },
  ],
  config: {
    test: [
      [true, false],
      [true, false],
    ],
  },

  // onPoll() {
  //   return {
  //     test: [false, false, true],
  //     redesign: ["staff", "preview", 30],
  //     algo: [[["staff", "preview"]], [30, 50, 100]],
  //   };

  //   return {
  //     test: true, // [true, false]
  //     test: false, // [false, false]
  //     test: "staff", // [["staff"], false]
  //     test: 50, // [50, false]
  //     test: ["staff", "preview"], // [["staff", "preview"], false]
  //     test: ["staff", "preview", 30], // [["staff", "preview", 30], false]
  //     var: [
  //       ["staff", "grp-a", 30],
  //       ["grp-b", 50],
  //     ], // [["staff", "grp-a", 30], ["grp-b", 50], false]
  //     var: false, // [false, false, false]
  //     var: "staff", // [["staff"], false, false],
  //     var: ["staff", "preview"], // [["staff", "preview"], false, false]
  //     var: [["staff", 50, 30], [25], [74]], //[['staff', 30], [25], [74]] => invalid!
  //   };
  // },
});

/**
 * true => [true, false, false]
 * false => [false, false, false]
 * 30 => [30, 100]
 * "staff" => ["staff", true]
 */

/**
 * true => [false, true]
 * false => [true, false]
 * 30 => [30, 100-30]
 * "staff" => [, "staff"]
 */

type FeatConf =
  | boolean
  | string
  | number
  | [string, number]
  | [string, number][];

keat.eval("test"); // returns boolean
keat.eval("algo"); // returns 'basic' | 'heuristic' | 'brute'
