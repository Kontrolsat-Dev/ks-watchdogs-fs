// src/features/not-found/index.tsx
// Página 404 - Rota não encontrada

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EASTER_EGG_MESSAGES = [
  "Ainda à procura? 🔍",
  "Esta página foi abduzida por aliens 👽",
  "O programador estava de férias ☀️",
  "Ups... alguém apagou isto 🗑️",
  "Aqui não há nada... ou há? 🤔",
  "Error 404: Café não encontrado ☕",
  "Houston, temos um problema 🚀",
  "Este link foi para a Matrix 💊",
];

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const handleEasterEgg = () => {
    setClickCount((c) => c + 1);
    if (clickCount >= 2) {
      const randomMsg = EASTER_EGG_MESSAGES[Math.floor(Math.random() * EASTER_EGG_MESSAGES.length)];
      setMessage(randomMsg);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* 404 grande com efeito - clicável para easter egg */}
      <div className="relative cursor-pointer select-none" onClick={handleEasterEgg}>
        <span className="text-[12rem] font-bold leading-none text-muted-foreground/10">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-foreground hover:scale-105 transition-transform">
            404
          </span>
        </div>
      </div>

      {/* Mensagem - muda com easter egg */}
      <h1 className="text-2xl font-semibold mt-4">
        {message || "Página não encontrada"}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        {message 
          ? "Continua a clicar, quem sabe o que encontras..."
          : "A página que procuras não existe ou foi movida. Verifica o endereço ou volta à página inicial."
        }
      </p>

      {/* Contador secreto */}
      {clickCount > 0 && clickCount < 3 && (
        <p className="text-xs text-muted-foreground/40 mt-2 animate-pulse">
          Clicaste {clickCount}x no 404... continua 👀
        </p>
      )}

      {/* Ações */}
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={() => navigate("/")}>
          <Home className="h-4 w-4 mr-2" />
          Página Inicial
        </Button>
      </div>
    </div>
  );
}
