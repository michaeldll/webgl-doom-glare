import esbuild from "esbuild"
import { sassPlugin } from 'esbuild-sass-plugin'
import { glsl } from "esbuild-plugin-glsl";

const port = 1234

console.log(`running on http://localhost:${port}`)

esbuild.serve({
  port,
  servedir: "public",
}, {
  plugins: [
    sassPlugin({ type: "style" }),
    glsl({ minify: false })
  ],
  entryPoints: ["src/doomGlareApp.ts", "src/scss/global.scss"],
  outdir: "public/built",
  bundle: true,
})
