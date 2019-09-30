module.exports = {
    "env": {
      "browser": true,
      "node": true
    },
    "extends": ["airbnb", "plugin:jsx-a11y/recommended"],
    "parser": "babel-eslint",
    "plugins": [
      "jsx-a11y", "babel"
    ],
    "rules" : {
      "react/jsx-filename-extension": "off",
      "no-underscore-dangle": "off",
    }
};
