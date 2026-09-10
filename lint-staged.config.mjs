export default {
  '**/*.{ts,tsx,md,json,yaml,css,js,jsx}': () =>
    'prettier --write --ignore-unknown "**/*.{ts,tsx,md,json,yaml,css,js,jsx}"',
};
