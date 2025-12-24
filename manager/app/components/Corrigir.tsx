"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";

interface Response {
  id: number;
  questao: {
    enunciado: string;
  };
  resposta: string;
  pontuacao: number | null;
}

interface CorrigirProps {
  circleId: string | number;
}

const Corrigir: React.FC<CorrigirProps> = ({ circleId }) => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scores, setScores] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const result = await apiClient.get(`/exibir_respostas/${circleId}`);
        if (result.data.message !== "ok") {
          setError(result.data.details);
        } else {
          const fetchedResponses = result.data.details;
          setResponses(fetchedResponses);
          const initialScores: Record<number, string> = {};
          fetchedResponses.forEach((resp: Response) => {
            initialScores[resp.id] = resp.pontuacao !== null && resp.pontuacao !== undefined ? resp.pontuacao.toString() : "";
          });
          setScores(initialScores);
        }
      } catch (err) {
        setError("Error fetching data from backend");
      } finally {
        setLoading(false);
      }
    };

    if (circleId) fetchResponses();
  }, [circleId]);

  const handleScoreChange = (id: number, value: string) => {
    setScores({ ...scores, [id]: value });
  };

  const handleScore = async (idresp: number) => {
    try {
      const scoreValue = scores[idresp] || "";
      const score = parseFloat(scoreValue);
      
      if (isNaN(score)) {
        alert("Por favor, insira uma pontuação válida");
        return;
      }

      const response = await apiClient.post(`/pontuar_resposta`, {
        id: idresp,
        pontuacao: score,
      });
      
      if (response.data.message !== "ok") {
        alert(response.data.details);
      } else {
        setResponses(responses.map(resp => 
          resp.id === idresp ? { ...resp, pontuacao: score } : resp
        ));
      }
    } catch (err) {
      alert("Error sending score to backend");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 text-muted-foreground">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-medium animate-pulse">Carregando respostas...</p>
    </div>
  );
  
  if (error) return (
    <div className="card p-10 border-destructive/30 bg-destructive/5 text-center space-y-4">
      <div className="text-destructive text-4xl">⚠️</div>
      <p className="text-destructive font-bold">{error}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold tracking-tight">Avaliação de Respostas</h2>
        <span className="px-3 py-1 rounded-full bg-accent text-xs font-bold text-muted-foreground">{responses.length} Respostas Pendentes</span>
      </div>

      <div className="space-y-6">
        {responses.map((resp) => (
          <div key={resp.id} className="card overflow-hidden border-border/50 hover:border-primary/20 transition-all group">
            <div className="bg-accent/30 p-4 border-b border-border/50">
              <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-widest mb-1">Questão #{resp.id}</h4>
              <p className="text-lg leading-relaxed font-medium">{resp.questao.enunciado}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resposta do Aluno</label>
                <div className="bg-accent/10 p-4 rounded-xl border border-border/30 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                  {resp.resposta}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-end justify-between pt-4 border-t border-border/30">
                <div className="w-full sm:w-48 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Atribuir Nota</label>
                  <input
                    type="number"
                    step="0.01"
                    value={scores[resp.id] || ""}
                    onChange={(e) => handleScoreChange(resp.id, e.target.value)}
                    placeholder="0.00"
                    className="input-field h-12 text-lg font-bold"
                  />
                </div>
                <button 
                  onClick={() => handleScore(resp.id)}
                  className={`btn-primary h-12 px-8 text-base font-bold shadow-lg transition-all ${
                    resp.pontuacao !== null ? "bg-green-600 hover:bg-green-700 shadow-green-900/20" : "shadow-primary/20"
                  }`}
                >
                  {resp.pontuacao !== null ? "Atualizar Nota" : "Confirmar Nota"}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {responses.length === 0 && (
          <div className="card p-20 border-dashed text-center text-muted-foreground bg-accent/5">
            <p className="text-lg font-medium">Nenhuma resposta encontrada para este círculo.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Corrigir;
