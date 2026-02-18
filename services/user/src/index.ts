import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";

dotenv.config({ quiet: true });

const app = express();

app.use(express.json());

app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`User Service is running on port http://localhost:${PORT}`);
});
