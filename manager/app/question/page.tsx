"use client";

import React, { useEffect, useState, FormEvent } from "react";
import apiClient, { API_URL } from "@/lib/api";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  Link2,
  FileText,
  ListTodo,
  AlignLeft,
  Calendar,
  Layers
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface Question {
  id: number;
  enunciado: string;
  type: string;
  resposta?: string;
  lacunas?: string;
  alternativas?: Array<{ id: number; descricao: string; certa: boolean }>;
  observacao?: string;
  ativa: string;
  circulo_id?: number;
}

interface Circle {
  id: number;
  nome: string;
}

interface QuestionForm {
  enunciado: string;
  type: string;
  resposta: string;
  observacao: string;
  ativa: string;
}

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCircle, setFilterCircle] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  const [form, setForm] = useState<QuestionForm>({ 
    enunciado: "", 
    type: "aberta", 
    resposta: "", 
    observacao: "", 
    ativa: "1" 
  });
  
  const [selectedCircle, setSelectedCircle] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  function ajustaImagens(texto: string): string {
    const url = `${API_URL}/imagem/`;
    return (texto || "").replace(/<img src=/gi, "<img src=" + url);
  }

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.enunciado.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         q.id.toString() === searchTerm;
    const matchesCircle = filterCircle === "all" || q.circulo_id === Number(filterCircle);
    return matchesSearch && matchesCircle;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        apiClient.get("/question"),
        apiClient.get("/circle")
      ]);
      setQuestions(qRes.data.details || []);
      setCircles(cRes.data.details || []);
    } catch (error) {
      toast.error("Erro ao carregar dados do banco");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { enunciado, type, resposta, observacao, ativa } = form;
    let dados: Record<string, unknown> = { type, enunciado, observacao, ativa };

    if (type === "aberta") {
      dados.resposta = resposta;
    } else if (type === "completar") {
      dados.lacunas = resposta;
    } else if (type === "multiplaescolha_remodelada") {
      const alternativas = resposta.split("\n");
      const corretas: Array<{ op: string }> = [];
      const erradas: Array<{ op: string }> = [];
      alternativas.forEach(alt => {
        if (alt.startsWith("===>")) {
          corretas.push({ op: alt.substring(4).trim() });
        } else if (alt.trim()) {
          erradas.push({ op: alt.trim() });
        }
      });
      dados.corrects = corretas;
      dados.wrongs = erradas;
    }

    try {
      if (isEditing && editId !== null) {
        await apiClient.put(`/question/${editId}`, form);
        toast.success("Questão atualizada com sucesso!");
      } else {
        const res = await apiClient.post("/incluir_questao", dados);
        if (res.data.message === "ok") {
          toast.success("Questão adicionada ao banco!");
        } else {
          toast.error(res.data.details);
          return;
        }
      }
      resetForm();
      fetchData();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar questão");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({ 
      enunciado: "", 
      type: "aberta", 
      resposta: "", 
      observacao: "", 
      ativa: "1" 
    });
  };

  const handleEdit = (q: Question) => {
    setForm({
      enunciado: q.enunciado || "",
      type: q.type || "aberta",
      resposta: q.type === "completar" ? q.lacunas || "" : q.resposta || "",
      observacao: q.observacao || "",
      ativa: q.ativa || "1"
    });
    setEditId(q.id);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Deseja permanentemente remover esta questão?")) {
      try {
        await apiClient.delete(`/question/${id}`);
        toast.success("Questão removida do sistema");
        setQuestions(questions.filter(q => q.id !== id));
      } catch (error) {
        toast.error("Erro ao remover questão");
      }
    }
  };

  const handleToggleActive = async (q: Question) => {
    const newStatus = q.ativa === "1" ? "0" : "1";
    try {
      await apiClient.put(`/question/${q.id}`, { ...q, ativa: newStatus });
      toast.success(`Questão ${newStatus === "1" ? "ativada" : "desativada"}`);
      setQuestions(questions.map(quest => quest.id === q.id ? { ...quest, ativa: newStatus } : quest));
    } catch (error) {
      toast.error("Erro ao alterar status");
    }
  };

  const handleAssignToCircle = async () => {
    if (!selectedQuestionId || !selectedCircle) return;
    try {
      await apiClient.post(`/questions_circle/${selectedQuestionId}/${selectedCircle}`);
      toast.success("Questão vinculada ao círculo!");
      setIsAssignDialogOpen(false);
      setSelectedQuestionId(null);
      setSelectedCircle("");
      fetchData();
    } catch (error) {
      toast.error("Erro ao vincular questão");
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    switch (type) {
      case "aberta": return <Badge variant="outline" className="gap-1"><AlignLeft className="size-3" /> Aberta</Badge>;
      case "completar": return <Badge variant="outline" className="gap-1"><FileText className="size-3" /> Lacunas</Badge>;
      case "multiplaescolha": return <Badge variant="outline" className="gap-1"><ListTodo className="size-3" /> Múltipla Escolha</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Banco de Questões</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu acervo de avaliações.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="size-4" />
                Nova Questão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{isEditing ? "Editar Questão" : "Adicionar Questão"}</DialogTitle>
                <DialogDescription>
                  Configure o enunciado e a resposta esperada para o aluno.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Questão</Label>
                    <Select 
                      value={form.type} 
                      onValueChange={v => setForm({ ...form, type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aberta">Aberta</SelectItem>
                        <SelectItem value="completar">Completar (lacunas)</SelectItem>
                        <SelectItem value="multiplaescolha_remodelada">Múltipla Escolha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ativa">Status (Ativa?)</Label>
                    <Select 
                      value={form.ativa} 
                      onValueChange={v => setForm({ ...form, ativa: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Ativa</SelectItem>
                        <SelectItem value="0">Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enunciado">Enunciado (HTML permitido)</Label>
                  <Textarea 
                    id="enunciado" 
                    placeholder="Digite o enunciado da questão..." 
                    className="min-h-[120px] font-mono text-sm"
                    value={form.enunciado}
                    onChange={e => setForm({ ...form, enunciado: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resposta">
                    {form.type === "multiplaescolha_remodelada" 
                      ? "Alternativas (Uma por linha, use ===> para a correta)" 
                      : "Resposta Esperada / Lacunas (separadas por |)"}
                  </Label>
                  <Textarea 
                    id="resposta" 
                    placeholder={form.type === "multiplaescolha_remodelada" ? "Ex:\n===> Correta\nIncorreta 1\nIncorreta 2" : "Ex: python | linux"} 
                    className="min-h-[100px]"
                    value={form.resposta}
                    onChange={e => setForm({ ...form, resposta: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="obs">Observação (Oculta para alunos)</Label>
                  <Input 
                    id="obs" 
                    placeholder="Notas internas..." 
                    value={form.observacao}
                    onChange={e => setForm({ ...form, observacao: e.target.value })}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{isEditing ? "Salvar Alterações" : "Adicionar ao Banco"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/50 p-4 rounded-xl border border-border/50">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por enunciado ou ID..." 
            className="pl-10 bg-transparent border-none focus-visible:ring-0 shadow-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground shrink-0" />
          <Select value={filterCircle} onValueChange={setFilterCircle}>
            <SelectTrigger className="bg-transparent border-none focus:ring-0 shadow-none">
              <SelectValue placeholder="Filtrar por Círculo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Círculos</SelectItem>
              {circles.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="ml-auto font-bold shrink-0">
            {filteredQuestions.length} Questões
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredQuestions.map((q) => (
          <Card key={q.id} className="border-border/50 shadow-md hover:border-primary/30 transition-all group overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between bg-accent/10 pb-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="font-mono text-[10px]">ID: {q.id}</Badge>
                  {getQuestionTypeBadge(q.type)}
                  {q.ativa === "0" && <Badge variant="destructive" className="bg-destructive/10 text-destructive border-none uppercase text-[10px] font-black">Inativa</Badge>}
                </div>
                <div 
                  className="text-lg leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: ajustaImagens(q.enunciado) }} 
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Opções da Questão</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleEdit(q)}>
                    <Pencil className="mr-2 size-4" /> Editar Conteúdo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleActive(q)}>
                    {q.ativa === "1" ? <><EyeOff className="mr-2 size-4" /> Desativar</> : <><Eye className="mr-2 size-4" /> Ativar</>}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSelectedQuestionId(q.id);
                    setIsAssignDialogOpen(true);
                  }}>
                    <Link2 className="mr-2 size-4" /> Vincular a Círculo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="mr-2 size-4" /> Excluir Questão
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="py-6 space-y-4">
              <div className="p-4 rounded-xl bg-accent/30 border border-border/50 text-sm space-y-3">
                {q.type === "multiplaescolha" && q.alternativas && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Alternativas Cadastradas</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.alternativas.map(a => (
                        <div key={a.id} className={`flex items-center gap-3 p-2 rounded-lg border ${a.certa ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-card border-border/50 text-muted-foreground"}`}>
                          <div className={`size-2 rounded-full ${a.certa ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                          <span className="font-medium">{a.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(q.type === "aberta" || q.type === "completar") && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Resposta Esperada</p>
                    <p className="font-mono text-primary bg-primary/5 p-2 rounded border border-primary/10">
                      {q.type === "aberta" ? q.resposta : q.lacunas}
                    </p>
                  </div>
                )}
                {q.observacao && (
                  <div className="pt-2 flex items-start gap-2 border-t border-border/30 mt-2">
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary/30 text-primary">NOTAS</Badge>
                    <p className="italic text-xs text-muted-foreground">{q.observacao}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredQuestions.length === 0 && (
          <div className="card p-20 border-dashed text-center flex flex-col items-center gap-4">
            <div className="p-4 bg-accent/10 rounded-full">
              <Search className="size-8 text-muted-foreground opacity-20" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhuma questão encontrada com estes filtros.</p>
            <Button variant="outline" onClick={() => {setSearchTerm(""); setFilterCircle("all")}}>Limpar Filtros</Button>
          </div>
        )}
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular ao Círculo</DialogTitle>
            <DialogDescription>
              Selecione o círculo de avaliação onde esta questão deve aparecer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <Label>Círculo de Destino</Label>
              <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um círculo..." />
                </SelectTrigger>
                <SelectContent>
                  {circles.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAssignToCircle} disabled={!selectedCircle}>Confirmar Vínculo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
