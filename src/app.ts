import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes";
import versionRoutes from "./routes/version.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/projects", projectRoutes);
app.use("/api/versions", versionRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Compiler backend is running 🚀",
  });
});

export default app;