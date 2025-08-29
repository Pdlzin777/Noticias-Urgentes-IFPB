import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "./auth.js";

const prisma = new PrismaClient();
const router = Router();

// Listagem com paginação
router.get("/", async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);

  const [items, total] = await Promise.all([
    prisma.news.findMany({
      skip,
      take: Number(pageSize),
      orderBy: { publishedAt: "desc" },
      include: { author: true },
    }),
    prisma.news.count(),
  ]);

  res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
});

// Destaques para o carrossel
router.get("/featured", async (_req, res) => {
  const items = await prisma.news.findMany({
    where: { isFeatured: true },
    orderBy: { publishedAt: "desc" },
    take: 5,
  });
  res.json(items);
});

// Criar notícia (precisa estar logado)
router.post("/", authMiddleware, async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Não autenticado" });

  const { title, summary, content, imageUrl, category, campus, isFeatured } =
    req.body;

  const item = await prisma.news.create({
    data: {
      title,
      summary,
      content,
      imageUrl,
      category,
      campus,
      isFeatured: !!isFeatured,
      authorId: user.id,
    },
  });

  res.json(item);
});

// Atualizar notícia
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, summary, content, imageUrl, category, campus, isFeatured } =
    req.body;

  const item = await prisma.news.update({
    where: { id: Number(id) },
    data: {
      title,
      summary,
      content,
      imageUrl,
      category,
      campus,
      isFeatured,
    },
  });

  res.json(item);
});

// Deletar notícia
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  await prisma.news.delete({ where: { id: Number(id) } });
  res.json({ ok: true });
});

export default router;
