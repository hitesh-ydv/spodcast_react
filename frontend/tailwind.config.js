
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // include your file paths
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000", // black background
        theme: "#121212",      // main theme color
        object: "#b3b3b3",     // secondary text / icons
        hover: "#202020",      // hover color
        textwhite: "#ffffff",  // text color
      },
    },
  },
  plugins: [],
};
