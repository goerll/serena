"use client";

import React, { useState, FormEvent } from "react";
import apiClient from "@/lib/api";
import { StudentsCsvToJson } from "@/lib/utils";
import { toast } from "sonner";
import { 
  UserPlus, 
  Upload, 
  Trash2, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Settings2,
  Database
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function ImportStudents() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [delimiter, setDelimiter] = useState(";");
  const [emails, setEmails] = useState("");
  const [buttonValue, setButtonValue] = useState("");
  const [observacao, setObservacao] = useState("|g:optweb-301-2025|");
  const [StudentsList, setStudentsList] = useState(
    `AMANDA PAZIANOTI HORST,amanda.horst07@gmail.com,|g:optweb-301-2025|
ANTONIO HENRIQUE ROHLING FROEHNER,rf.antonio2007@gmail.com,|g:optweb-301-2025|`
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const action_ImportStudents = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (buttonValue === "clean") {
        setStudentsList(StudentsList.replace(/[0-9]/g, ""));
        toast.success("Números removidos da lista");
      } 
      else if (buttonValue === "emails") {
        const result: string[] = [];
        const lines = StudentsList.split("\n");
        const string_emails = emails;

        if (string_emails.includes("@")) {
          const emailsArr = string_emails.split(delimiter);
          for (let i = 0; i < lines.length; i++) {
            const newLine = `${lines[i].trim()},${emailsArr[i]?.trim() || ""}`;
            result.push(newLine);
          }
          setStudentsList(result.join("\n"));
          toast.success("E-mails mesclados à lista");
        } else {
          setError("Insira os emails no campo correspondente.");
          toast.error("Formato de e-mail inválido");
        }
      } 
      else if (buttonValue === "obs") {
        const result: string[] = [];
        const lines = StudentsList.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim()) {
            result.push(`${lines[i].trim()},${observacao}`);
          }
        }
        setStudentsList(result.join("\n"));
        toast.success("Observação aplicada em massa");
      } 
      else if (buttonValue === "save") {
        const paraEnviar = StudentsCsvToJson(StudentsList);
        if (paraEnviar.length === 0) {
          setError("Nenhum dado válido para enviar.");
          return;
        }
        
        setIsProcessing(true);
        try {
          const response = await apiClient.post("/incluir_respondentes", paraEnviar);
          const resp = response.data.details;
          
          if (typeof resp === 'string') {
            setMessage(resp.replaceAll(";", "\n"));
          } else {
            setMessage("Estudantes cadastrados com sucesso!");
          }
          toast.success(`${paraEnviar.length} estudantes processados`);
        } finally {
          setIsProcessing(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      toast.error("Falha no processamento");
    }
  };

  const lineCount = StudentsList.split('\n').filter(Boolean).length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Importação em Massa</h1>
        <p className="text-muted-foreground mt-1">Cadastre turmas inteiras utilizando editores de texto ou arquivos CSV.</p>
      </header>

      <form onSubmit={action_ImportStudents} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Editor */}
        <div className="xl:col-span-8">
          <Card className="border-border/50 shadow-xl flex flex-col h-full bg-card overflow-hidden">
            <CardHeader className="bg-accent/5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <FileText className="size-4" />
                  Editor de Importação
                </div>
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setButtonValue("clean")}
                  className="text-xs font-bold uppercase tracking-tighter"
                >
                  <Trash2 className="size-3 mr-1" /> Limpar Números
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Textarea
                value={StudentsList}
                onChange={(e) => setStudentsList(e.target.value)}
                className="min-h-[500px] font-mono text-sm leading-relaxed border-none focus-visible:ring-0 p-6 bg-transparent resize-none no-scrollbar"
                placeholder="Nome do Aluno, email@exemplo.com, |g:turma|"
              />
            </CardContent>
            <CardFooter className="bg-accent/5 border-t border-border/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="font-mono text-xs px-2">
                  {lineCount} Linhas
                </Badge>
                {error && (
                  <div className="flex items-center gap-1.5 text-destructive text-xs font-bold uppercase">
                    <AlertCircle className="size-3" /> {error}
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                size="lg"
                onClick={() => setButtonValue("save")}
                disabled={isProcessing || lineCount === 0}
                className="px-10 font-bold shadow-xl shadow-primary/20 gap-2"
              >
                {isProcessing ? "Processando..." : <><Database className="size-4" /> Finalizar Cadastro</>}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tools Sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="border-border/50 shadow-lg bg-accent/5">
            <CardHeader>
              <div className="flex items-center gap-2 font-bold tracking-tight">
                <Settings2 className="size-4 text-primary" />
                Ferramentas de Formatação
              </div>
              <CardDescription>Ajuste os dados antes de processar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Tool */}
              <div className="space-y-4 p-4 rounded-xl bg-card border border-border/50 shadow-inner">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                  <Mail className="size-3" /> Mesclagem de E-mails
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Lista de E-mails (Sigaa)</Label>
                  <Textarea
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    placeholder="email1@ex; email2@ex..."
                    className="min-h-[100px] text-xs bg-accent/5"
                  />
                </div>
                <div className="flex items-end gap-3 pt-2">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Delimitador</Label>
                    <Input
                      value={delimiter}
                      onChange={(e) => setDelimiter(e.target.value)}
                      className="h-9 text-center font-mono"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="secondary"
                    onClick={() => setButtonValue("emails")}
                    className="h-9 flex-[2] font-bold"
                  >
                    Aplicar Emails
                  </Button>
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Group Tool */}
              <div className="space-y-4 p-4 rounded-xl bg-card border border-border/50 shadow-inner">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                  <UserPlus className="size-3" /> Atribuição de Grupo
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">ID do Grupo / Turma</Label>
                  <Input
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="h-9 font-mono bg-accent/5"
                    placeholder="|g:turma-2025|"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="secondary"
                  onClick={() => setButtonValue("obs")}
                  className="w-full h-9 font-bold"
                >
                  Aplicar Observação
                </Button>
              </div>
            </CardContent>
          </Card>

          {message && (
            <Card className="border-green-500/30 bg-green-500/5 overflow-hidden animate-in zoom-in-95 duration-300">
              <CardHeader className="bg-green-500/10 border-b border-green-500/20 py-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="size-4" /> Importação Concluída
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <pre className="text-[10px] font-mono text-green-400 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto no-scrollbar">
                  {message}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
}
