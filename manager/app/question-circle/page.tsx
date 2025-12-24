"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { 
  Link2, 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  Search,
  LayoutGrid,
  ListChecks,
  ChevronRight,
  Info
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  id: number;
  enunciado: string;
  type: string;
}

interface Circle {
  id: number;
  nome: string;
}

export default function QuestionsCircleCRUD() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState("");
  const [circleQuestions, setCircleQuestions] = useState<Question[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionToAdd, setSelectedQuestionToAdd] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBaseData();
  }, []);

  const fetchBaseData = async () => {
    try {
      const [cRes, qRes] = await Promise.all([
        apiClient.get("/circle"),
        apiClient.get("/question")
      ]);
      setCircles(cRes.data.details || []);
      setAllQuestions(qRes.data.details || []);
    } catch (error) {
      toast.error("Erro ao carregar dados iniciais");
    }
  };

  useEffect(() => {
    if (selectedCircle) {
      fetchCircleQuestions();
    } else {
      setCircleQuestions([]);
      setAvailableQuestions([]);
    }
  }, [selectedCircle, allQuestions]);

  const fetchCircleQuestions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/questions_circle/${selectedCircle}`);
      const assigned = res.data.details || [];
      setCircleQuestions(assigned);
      
      const assignedIds = new Set(assigned.map((q: Question) => q.id));
      setAvailableQuestions(allQuestions.filter(q => !assignedIds.has(q.id)));
    } catch (error) {
      toast.error("Erro ao carregar questões do círculo");
    } finally {
      setLoading(false);
    }
  };

  const addQuestionToCircle = async (qidOverride?: string) => {
    const qid = qidOverride || selectedQuestionToAdd;
    if (!qid || !selectedCircle) return;
    
    try {
      await apiClient.post(`/questions_circle/${qid}/${selectedCircle}`);
      toast.success("Questão vinculada com sucesso!");
      setSelectedQuestionToAdd("");
      fetchCircleQuestions();
    } catch (error) {
      toast.error("Erro ao vincular questão");
    }
  };

  const removeQuestionFromCircle = async (qid: number) => {
    if (!window.confirm("Remover esta questão do círculo?")) return;
    try {
      await apiClient.delete(`/questions_circle/${qid}/${selectedCircle}`);
      toast.success("Vínculo removido");
      fetchCircleQuestions();
    } catch (error) {
      toast.error("Erro ao remover vínculo");
    }
  };

  const filteredAvailable = availableQuestions.filter(q => 
    q.enunciado.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Associação de Questões</h1>
        <p className="text-muted-foreground mt-1">Gerencie o conteúdo de cada círculo de avaliação.</p>
      </header>

      <Card className="border-border/50 bg-accent/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-8 space-y-2 flex-1 border-b md:border-b-0 md:border-r border-border/50">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Etapa 1</label>
              <h3 className="text-xl font-bold">Selecione o Círculo</h3>
              <p className="text-sm text-muted-foreground">Escolha qual avaliação deseja configurar agora.</p>
            </div>
            <div className="p-8 flex-[2] w-full bg-card/50">
              <Select 
                value={selectedCircle} 
                onValueChange={setSelectedCircle}
              >
                <SelectTrigger className="h-14 text-lg font-bold border-none shadow-none focus:ring-0">
                  <SelectValue placeholder="Escolha um círculo..." />
                </SelectTrigger>
                <SelectContent>
                  {circles.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()} className="font-medium">
                      {c.nome} (ID: {c.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCircle ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
          {/* Left Column: Current questions */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <ListChecks className="size-4 text-primary" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Conteúdo do Círculo</h2>
              </div>
              <Badge variant="secondary" className="font-bold px-2 py-0.5">
                {circleQuestions.length} Atribuídas
              </Badge>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
              {loading ? (
                [1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
              ) : circleQuestions.length > 0 ? (
                circleQuestions.map(q => (
                  <Card key={q.id} className="border-border/50 hover:border-destructive/30 transition-all group relative">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] h-5">{q.type}</Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">ID: #{q.id}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm font-medium leading-relaxed line-clamp-2 pr-8">{q.enunciado}</p>
                    </CardContent>
                    <button
                      onClick={() => removeQuestionFromCircle(q.id)}
                      className="absolute right-3 bottom-3 h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                      title="Remover do círculo"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </Card>
                ))
              ) : (
                <div className="card p-20 border-dashed flex flex-col items-center justify-center gap-4 text-muted-foreground bg-accent/5">
                  <Info className="size-8 opacity-20" />
                  <p className="text-center font-medium">Este círculo ainda está vazio.<br/>Adicione questões à direita.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Add more */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <LayoutGrid className="size-4 text-primary" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Banco Disponível</h2>
              </div>
              <Badge variant="outline" className="font-bold px-2 py-0.5 border-border/50">
                {availableQuestions.length} Restantes
              </Badge>
            </div>

            <Card className="border-border/50 shadow-lg shadow-black/5 bg-card overflow-hidden">
              <CardHeader className="bg-accent/5 border-b border-border/50 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filtrar banco por enunciado ou ID..." 
                    className="pl-10 h-11 bg-card"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={selectedQuestionToAdd} onValueChange={setSelectedQuestionToAdd}>
                    <SelectTrigger className="h-11 flex-1">
                      <SelectValue placeholder="Pesquisa rápida..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {filteredAvailable.slice(0, 50).map(q => (
                        <SelectItem key={q.id} value={q.id.toString()}>
                          {q.id} | {q.enunciado.substring(0, 60)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => addQuestionToCircle()} 
                    disabled={!selectedQuestionToAdd}
                    className="h-11 px-6 shadow-lg shadow-primary/20"
                  >
                    <Plus className="size-4 mr-2" /> Vincular
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                  {filteredAvailable.length > 0 ? (
                    filteredAvailable.slice(0, 20).map(q => (
                      <div 
                        key={q.id} 
                        className="flex items-center justify-between p-4 border-b border-border/30 hover:bg-accent/30 transition-colors cursor-pointer group"
                        onClick={() => addQuestionToCircle(q.id.toString())}
                      >
                        <div className="space-y-1 min-w-0 pr-4">
                          <p className="text-sm font-medium leading-tight truncate">{q.enunciado}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{q.type} • ID: {q.id}</p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground italic">
                      Nenhuma questão disponível encontrada.
                    </div>
                  )}
                </div>
              </CardContent>
              {filteredAvailable.length > 20 && (
                <CardFooter className="bg-accent/5 p-3 flex justify-center border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Mostrando primeiras 20 questões. Use a busca para filtrar.
                  </p>
                </CardFooter>
              )}
            </Card>
          </section>
        </div>
      ) : (
        <Card className="p-32 border-dashed flex flex-col items-center justify-center gap-6 text-muted-foreground bg-accent/5 animate-pulse">
          <div className="p-6 bg-card rounded-full shadow-inner border border-border/50">
            <Link2 className="size-16 opacity-10" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-black tracking-tight text-foreground/50">Aguardando Seleção</p>
            <p className="text-sm">Selecione um círculo acima para configurar o conteúdo.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
