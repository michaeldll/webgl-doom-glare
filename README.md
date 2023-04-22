# hunter-gatherer boilerplate

As barebones I'm willing to go. You probably don't want to use this.

Featuring: 

- Only 3 dependencies
- Fast build times
- Typescript, GLSL and SASS support

## How to develop :

```
npm i && npm run dev
```

This will serve `public/index.html` using bundled `public/built/app.js` and `public/built/scss/` from `/src/app.ts` on `localhost:1234`.

Assets need to be fetched from the `public` folder.

It does not output the bundle to disk.

## How to deploy
```
npm run build
```

to minify files, then deploy the `public` folder.

This essentially uses the same script as the `dev` command, but runs it just once and outputs the minified bundle to `public/built`.
