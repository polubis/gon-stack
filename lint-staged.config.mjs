export default {
  '**/*.{ts,tsx,json,yaml,css,js,jsx}': () =>
    'prettier --write --ignore-unknown "**/*.{ts,tsx,json,yaml,css,js,jsx}"',
};
