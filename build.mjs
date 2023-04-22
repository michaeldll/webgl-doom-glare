import esbuild from "esbuild"
import { sassPlugin } from 'esbuild-sass-plugin'
import { glsl } from "esbuild-plugin-glsl";

esbuild.build({
  plugins: [
    sassPlugin({ type: "style" }),
    glsl({ minify: true })
  ],
  minify: true,
  entryPoints: ["src/doomGlareApp.ts", "src/scss/global.scss"],
  outdir: "public/built",
  bundle: true
})
