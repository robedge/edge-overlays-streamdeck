import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/plugin.ts",
  output: {
    file: "com.edgeoverlays.iracing.sdPlugin/bin/plugin.js",
    format: "esm",
    sourcemap: true,
  },
  plugins: [
    typescript(),
    nodeResolve({
      exportConditions: ["node"],
    }),
  ],
};
