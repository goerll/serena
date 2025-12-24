import React from "react";
import Link from "next/link";
import { 
  Users, 
  CircleDot, 
  FileQuestion, 
  ArrowUpRight,
  PlusCircle,
  History,
  Activity
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const dashboardStats = [
  { label: "Círculos Ativos", value: "3", sub: "+1 desde ontem", icon: CircleDot, trend: "up" },
  { label: "Total de Questões", value: "124", sub: "85% revisadas", icon: FileQuestion, trend: "neutral" },
  { label: "Estudantes", value: "48", sub: "2 turmas ativas", icon: Users, trend: "up" },
];

const recentCircles = [
  { id: 1, name: "Avaliação de JavaScript Intermediário", updated: "há 2 horas", status: "Active" },
  { id: 2, name: "Quiz de React Server Components", updated: "há 5 horas", status: "Active" },
  { id: 3, name: "Introdução a TypeScript", updated: "ontem", status: "Draft" },
];

export default function Home() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Bem-vindo ao centro de controle do Serena.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <History className="size-4" />
            Histórico
          </Button>
          <Button className="gap-2">
            <PlusCircle className="size-4" />
            Novo Círculo
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden border-border/50 hover:border-primary/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <stat.icon className="size-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Activity className="size-3 text-green-500" />
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Atalhos para as tarefas mais comuns.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="secondary" className="h-24 flex-col gap-2 group hover:bg-primary hover:text-primary-foreground transition-all">
              <Link href="/circle">
                <CircleDot className="size-6 transition-transform group-hover:scale-110" />
                <span className="font-bold">Gerenciar Círculos</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-24 flex-col gap-2 group hover:bg-primary hover:text-primary-foreground transition-all">
              <Link href="/question">
                <FileQuestion className="size-6 transition-transform group-hover:scale-110" />
                <span className="font-bold">Nova Questão</span>
              </Link>
            </Button>
          </CardContent>
          <CardFooter className="mt-auto border-t pt-6">
            <p className="text-xs text-muted-foreground italic">Dica: Use o menu lateral para acesso rápido a todas as funções.</p>
          </CardFooter>
        </Card>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>Círculos Recentes</CardTitle>
              <CardDescription>Últimas avaliações modificadas.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-primary">
              Ver todos <ArrowUpRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentCircles.map((circle, i) => (
              <React.Fragment key={circle.id}>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-all border border-transparent hover:border-border group">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{circle.name}</p>
                    <p className="text-xs text-muted-foreground">{circle.updated}</p>
                  </div>
                  <Badge variant={circle.status === "Active" ? "default" : "secondary"}>
                    {circle.status}
                  </Badge>
                </div>
                {i < recentCircles.length - 1 && <Separator className="my-1 opacity-50" />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
