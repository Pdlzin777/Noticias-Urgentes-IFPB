import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Usuário admin
  const passwordHash = await bcrypt.hash("123456", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ifpb.edu.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@ifpb.edu.br",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  // Usuário comum
  const user = await prisma.user.upsert({
    where: { email: "aluno@ifpb.edu.br" },
    update: {},
    create: {
      name: "Aluno Teste",
      email: "aluno@ifpb.edu.br",
      password: passwordHash,
      role: "USER",
    },
  });

  // Notícias de exemplo
  const newsData = [
    {
      title: "Greve de servidores do IFPB",
      summary: "Servidores anunciam paralisação a partir da próxima semana.",
      content: "Texto completo da notícia sobre a greve...",
      imageUrl: "https://picsum.photos/800/400?1",
      category: "Educação",
      campus: "João Pessoa",
      isFeatured: true,
      authorId: admin.id
    },
    {
      title: "Novo restaurante no campus",
      summary: "Restaurante universitário inaugura espaço ampliado.",
      content: "Texto completo da notícia sobre o RU...",
      imageUrl: "https://picsum.photos/800/400?2",
      category: "Infraestrutura",
      campus: "Cajazeiras",
      isFeatured: false,
      authorId: user.id
    },
    {
      title: "Semana de Tecnologia no IFPB",
      summary: "Evento reúne palestras e oficinas sobre inovação.",
      content: "Texto completo da notícia sobre a Semana de Tecnologia...",
      imageUrl: "https://picsum.photos/800/400?3",
      category: "Eventos",
      campus: "João Pessoa",
      isFeatured: true,
      authorId: admin.id
    }
  ];

  // Inserir notícias uma por uma
  for (const n of newsData) {
    await prisma.news.create({
      data: n
    });
  }

  console.log("✅ Seed executado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
