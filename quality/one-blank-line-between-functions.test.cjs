"use strict";

const { RuleTester } = require("eslint");
const plugin = require("./one-blank-line-between-functions.cjs");

const rule = plugin.rules["one-blank-line-between-functions"];
const tester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

tester.run("one-blank-line-between-functions", rule, {
  valid: [
    "function first() {}\n\nfunction second() {}",
    "const first = () => {};\n\nconst second = () => {};",
  ],
  invalid: [
    {
      code: "function first() {}\nfunction second() {}",
      output: "function first() {}\n\nfunction second() {}",
      errors: [{ messageId: "spacing" }],
    },
    {
      code: "const first = () => {};\n\n\nconst second = () => {};",
      output: "const first = () => {};\n\nconst second = () => {};",
      errors: [{ messageId: "spacing" }],
    },
  ],
});
