import express from "express";
import cors from "cors";
import chatRoutes from "./routes/routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/chat", chatRoutes);

app.listen(process.env.PORT, () => {
  console.log(
    `Servidor rodando na porta ${process.env.PORT}`
  );
});