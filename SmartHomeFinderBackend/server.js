import app from "./src/app.js";

process.env.NODE_OPTIONS = "--max_old_space_size=4096";

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});



