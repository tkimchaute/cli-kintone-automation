module.exports = {
    globals: {
        expect: true,
    },
    extends: ['@cybozu/eslint-config/presets/prettier'],
    env: {
        node: true,
        mocha: true,
        jest: true,
    },
};
