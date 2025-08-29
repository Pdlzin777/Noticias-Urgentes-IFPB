// src/server.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, register, login } from "./auth.js";
import newsRoutes from "./newsRoutes.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));

// =========================
// Rotas de autenticação
// =========================
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// =========================
// Rotas de notícias
// GET público, POST/PUT/DELETE protegido
// =========================
app.use(
  "/api/news",
  (req, res, next) => {
    if (req.method === "GET") return next();
    return authMiddleware(req, res, next);
  },
  newsRoutes
);

// =========================
// Seed opcional (primeira execução)
// =========================
app.get("/api/seed", async (_req, res) => {
  // Usuário admin
  const passwordHash = await import("bcryptjs").then(b => b.hash("admin123", 10));
  const admin = await prisma.user.upsert({
    where: { email: "admin@ifpb.edu.br" },
    update: {},
    create: { name: "Admin", email: "admin@ifpb.edu.br", password: passwordHash, role: "ADMIN" }
  });

  // Usuário comum
  const user = await prisma.user.upsert({
    where: { email: "aluno@ifpb.edu.br" },
    update: {},
    create: { name: "Aluno Teste", email: "aluno@ifpb.edu.br", password: passwordHash, role: "USER" }
  });

  // Notícias de exemplo
  const newsData = [
    {
      title: "Alerta: suspensão de aulas",
      summary: "Fortes chuvas em JP",
      content: "Aulas suspensas no Campus João Pessoa hoje.",
      imageUrl: "https://picsum.photos/1200/500?1",
      category: "Aviso",
      campus: "João Pessoa",
      isFeatured: true,
      authorId: admin.id
    },
    {
      title: "Prazo PSE",
      summary: "Inscrições prorrogadas",
      content: "Novo prazo até sexta.",
      imageUrl: "https://picsum.photos/1200/500?2",
      category: "Processos Seletivos",
      campus: "João Pessoa",
      isFeatured: true,
      authorId: admin.id
    },
    {
      title: "Manutenção elétrica",
      summary: "Biblioteca fechada",
      content: "Fechada das 14h às 18h.",
      imageUrl: "https://picsum.photos/1200/500?3",
      category: "Infraestrutura",
      campus: "João Pessoa",
      isFeatured: false,
      authorId: admin.id
    }
  ];

  for (const n of newsData) {
    await prisma.news.create({ data: n });
  }

  res.json({ ok: true, message: "Seed executado com sucesso!" });
});

// =========================
// Start do servidor
// =========================
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🚀 IFPB Urgente rodando em http://localhost:${port}`)
);
