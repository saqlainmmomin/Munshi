// Flat config. `next lint --strict` writes a legacy .eslintrc.json, which the
// installed ESLint 9 / eslint-config-next pair cannot load (it serialises the
// react plugin graph and hits a circular reference), so the presets are
// imported directly instead.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
