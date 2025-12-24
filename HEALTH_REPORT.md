# Relatório de Saúde do Código - Projeto Serena

Este documento detalha os problemas técnicos, dívidas técnicas e áreas que necessitam de refatoração no projeto Serena.

## 1. Caminhos Hardcoded (Portabilidade)

Atualmente, o projeto depende de caminhos absolutos específicos do ambiente de desenvolvimento original, o que impede a execução imediata em outras máquinas.

- **Localização**: `run/config.py` (linhas 40, 42) e `run/backend.py` (linha 38).
- **Problema**: Apontam para `/home/friend/Dropbox/10-serena-secrets/`.
- **Recomendação**: Utilizar variáveis de ambiente ou caminhos relativos ao diretório do projeto.

## 2. Inicialização Destrutiva do Banco de Dados

O arquivo de modelos contém um bloco de execução principal que apaga o banco de dados existente.

- **Localização**: `run/modelo.py` (linhas 384-386).
- **Problema**: `os.remove(arquivobd)` é executado se o arquivo existir, causando perda total de dados se o script for rodado acidentalmente.
- **Recomendação**: Remover a deleção automática ou adicionar uma confirmação/flag de segurança.

## 3. Acoplamento Frágil no Frontend (Next.js)

Alguns componentes do frontend administrativo dependem diretamente de elementos do DOM para obter informações críticas, como o IP do backend.

- **Localização**: `manager/app/components/Corrigir.tsx` (linhas 12, 13, 34).
- **Problema**: Uso de `document.getElementById("myip").innerText` para construir URLs de API. Isso é propenso a erros e não segue as melhores práticas do React.
- **Recomendação**: Utilizar variáveis de ambiente (`.env.local`) e um cliente HTTP centralizado (ex: instância do Axios).

## 4. Controle de Acesso e Segurança

O sistema de controle de IP é rudimentar e depende de um arquivo de texto externo.

- **Localização**: `run/backend.py` (funções `ipok` e `loadiptable`).
- **Problema**: O arquivo de IPs permitidos está em um caminho hardcoded. Além disso, a segurança baseada apenas em IP é limitada em ambientes modernos.
- **Recomendação**: Implementar um sistema de autenticação mais robusto (JWT ou similar) e gerenciar permissões no banco de dados.

## 5. Gerenciamento de Dependências

Até o momento, não havia um registro formal das dependências do backend Python.

- **Status**: Mitigado parcialmente com a criação do `run/requirements.txt`.
- **Próximo Passo**: Considerar o uso de um ambiente virtual (`venv`) ou Docker para isolar as dependências.

## 6. Consistência de Idioma e Código

O código apresenta uma mistura de Português e Inglês em nomes de variáveis, comentários e rotas.

- **Exemplos**: `id_circulo` vs `score`, `caminho_BD` vs `API`.
- **Recomendação**: Padronizar o idioma do código (preferencialmente Inglês para termos técnicos) e manter comentários claros.

## 7. Ausência de Testes Automatizados

Não foram encontrados testes unitários ou de integração para o backend ou frontend.

- **Recomendação**: Implementar testes para as rotas críticas da API e para a lógica de correção automática de questões.

