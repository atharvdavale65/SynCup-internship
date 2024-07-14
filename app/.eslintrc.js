module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react", "jsx-a11y", "prettier"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        singleQuote: false,
        semi: false,
        trailingComma: "all",
        ignoreRelative: true,
        endOfLine: "auto",
      },
    ],
    "react/jsx-filename-extension": [
      1,
      { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "off",
    "react/no-array-index-key": "off",
    "import/no-unresolved": "off",
    "import/extensions": "off",
    "react/no-unknown-property": "off",
    "react/jsx-props-no-spreading": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "no-useless-escape": "off",
    "no-nested-ternary": "off",
    "jsx-a11y/no-autofocus": "off",
    "jsx-a11y/tabindex-no-positive": "off",
    "import/prefer-default-export": "off",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "warn",
  },
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
    },
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
}
