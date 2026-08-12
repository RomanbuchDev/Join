"use strict";

const { RuleTester } = require("eslint");
const plugin = require("./two-blank-lines-between-functions.cjs");

const rule = plugin.rules["two-blank-lines-between-functions"];
const tester = new RuleTester({
  languageOptions: { ecmaVersion: "latest", sourceType: "module" },
});

tester.run("two-blank-lines-between-functions", rule, {
  valid: [
    "function first() {}\n\n\nfunction second() {}",
    "const first = () => {};\n\n\nconst second = () => {};",
  ],
  invalid: [
    {
      code: "function first() {}\nfunction second() {}",
      output: "function first() {}\n\n\nfunction second() {}",
      errors: [{ messageId: "spacing" }],
    },
    {
      code: "const first = () => {};\n\nconst second = () => {};",
      output: "const first = () => {};\n\n\nconst second = () => {};",
      errors: [{ messageId: "spacing" }],
    },
  ],
});
