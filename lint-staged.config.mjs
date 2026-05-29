export default {
  "*.{js,mjs,cjs,ts,tsx}": ["npm run lint:staged --", "prettier --write"],
  "*.{json,md,css,yml,yaml}": "prettier --write",
};
