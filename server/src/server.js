const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env"), override: true });

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Rating Platform API running on port ${PORT}`);
});
