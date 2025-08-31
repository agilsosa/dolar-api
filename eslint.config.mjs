import baseConfig from "@hono/eslint-config";
import ts from "typescript-eslint";

export default ts.config(baseConfig, {
  files: ["**/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: true,
      parser: ts.parser,
      baseConfig,
    },
  },
});
