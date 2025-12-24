"use client"; 

import React, { useEffect, useState, useRef } from "react";
import apiClient from "@/lib/api";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Activity, 
  User, 
  Calendar, 
  Layers
} from "lucide-react";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Circle {
  id: number;
  nome: string;
  data: string;
  filtro_respondente: string;
  ativo: string;
  maximo_questoes: number;
  autor: string;
  senha: string;
  n_reservas: number;
  questoes: unknown[];
}

interface CircleForm {
  nome: string;
  data: string;
  filtro_respondente: string;
  ativo: string;
  maximo_questoes: number;
  autor: string;
  senha: string;
  n_reservas: number;
  questoes: unknown[];
}

export default function Circles() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [searchTerm, setSearchByTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<CircleForm>({
    nome: "",
    data: "",
    filtro_respondente: "",
    ativo: "0",
    maximo_questoes: 10,
    autor: "",
    senha: "",
    n_reservas: 0,
    questoes: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const fetchCircles = async () => {
    try {
      const res = await apiClient.get("/list/Circulo");
      setCircles(res.data.details || []);
    } catch (error) {
      toast.error("Erro ao carregar círculos");
    }
  };

  useEffect(() => {
    fetchCircles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editId !== null) {
        await apiClient.put(`/circle/${editId}`, form);
        toast.success("Círculo atualizado com sucesso!");
      } else {
        await apiClient.post("/add/Circulo", form);
        toast.success("Círculo criado com sucesso!");
      }
      resetForm();
      fetchCircles();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar círculo");
    }
  };

  const handleEdit = (circle: Circle) => {
    setForm({ ...circle });
    setIsEditing(true);
    setEditId(circle.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o círculo "${nome}"?`)) {
      try {
        await apiClient.delete(`/delete/Circulo/${nome}`);
        toast.success("Círculo excluído!");
        fetchCircles();
      } catch (error) {
        toast.error("Erro ao excluir círculo");
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setForm({
      nome: "",
      data: "",
      filtro_respondente: "",
      ativo: "0",
      maximo_questoes: 10,
      autor: "",
      senha: "",
      n_reservas: 0,
      questoes: []
    });
  };

  const filteredCircles = circles.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.autor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Gerenciar Círculos</h1>
          <p className="text-muted-foreground mt-1">Configure e monitore seus círculos de avaliação.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="size-4" />
              Novo Círculo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{isEditing ? "Editar Círculo" : "Criar Novo Círculo"}</DialogTitle>
              <DialogDescription>
                Preencha as informações básicas para configurar o círculo de avaliação.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Círculo</Label>
                  <Input 
                    id="nome" 
                    placeholder="Ex: AV1 de Programação" 
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data de Realização</Label>
                  <Input 
                    id="data" 
                    placeholder="DD/MM/AAAA" 
                    value={form.data}
                    onChange={e => setForm({ ...form, data: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autor">Professor Responsável</Label>
                  <Input 
                    id="autor" 
                    placeholder="Nome do professor" 
                    value={form.autor}
                    onChange={e => setForm({ ...form, autor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select 
                    value={form.ativo} 
                    onValueChange={v => setForm({ ...form, ativo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Inativo</SelectItem>
                      <SelectItem value="1">Ativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filtro">Filtro de Respondentes (Grupo)</Label>
                  <Input 
                    id="filtro" 
                    placeholder="Ex: |g:301-2025|" 
                    value={form.filtro_respondente}
                    onChange={e => setForm({ ...form, filtro_respondente: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Máximo de Questões</Label>
                  <Input 
                    id="max" 
                    type="number"
                    value={form.maximo_questoes}
                    onChange={e => setForm({ ...form, maximo_questoes: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reserva">Questões Reserva</Label>
                  <Input 
                    id="reserva" 
                    type="number"
                    value={form.n_reservas}
                    onChange={e => setForm({ ...form, n_reservas: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha de Acesso (Opcional)</Label>
                  <Input 
                    id="senha" 
                    type="password"
                    placeholder="Senha para os alunos"
                    value={form.senha}
                    onChange={e => setForm({ ...form, senha: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{isEditing ? "Salvar Alterações" : "Criar Círculo"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex items-center gap-4 bg-card/50 p-4 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por nome ou professor..." 
            className="pl-10 bg-transparent border-none focus-visible:ring-0 shadow-none text-base"
            value={searchTerm}
            onChange={e => setSearchByTerm(e.target.value)}
          />
        </div>
        <Badge variant="secondary" className="px-3 py-1 font-bold">
          {filteredCircles.length} Encontrados
        </Badge>
      </div>

      <Card className="border-border/50 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-accent/30">
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nome do Círculo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Questões</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCircles.map((c) => (
              <TableRow key={c.id} className="group transition-colors hover:bg-accent/20">
                <TableCell className="font-mono text-xs text-muted-foreground">#{c.id}</TableCell>
                <TableCell className="font-bold">{c.nome}</TableCell>
                <TableCell>
                  <Badge 
                    variant={c.ativo === "1" ? "default" : "outline"}
                    className={c.ativo === "1" ? "bg-green-500/10 text-green-500 border-none" : "text-muted-foreground"}
                  >
                    {c.ativo === "1" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground flex items-center gap-2">
                  <User className="size-3" /> {c.autor || "N/A"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3" /> {c.data}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  <Badge variant="secondary" className="gap-1 font-mono">
                    <Layers className="size-3" /> {c.questoes.length}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(c)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => handleDelete(c.nome)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredCircles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Nenhum círculo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
