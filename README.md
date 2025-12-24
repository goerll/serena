# Serena

> Ferramenta de geração automática de avaliações circulares.

Serena é um sistema para criação e gestão de avaliações circulares, composto por um backend em Python (Flask) e um frontend moderno em Next.js.

## 🏗️ Arquitetura

O projeto está organizado da seguinte forma:

- `run/`: Backend em Python utilizando Flask e SQLAlchemy (SQLite).
  - `backend.py`: API principal para estudantes.
  - `staff.py`: API administrativa para gestão de questões e círculos.
  - `modelo.py`: Definições dos modelos de dados.
- `manager/`: Frontend administrativo moderno desenvolvido com Next.js e Tailwind CSS.
- `other/`: Documentação, códigos legados (Vue, React) e scripts de utilidade.

## 🚀 Como Executar

### 1. Backend (Python)

Certifique-se de ter o Python 3 instalado.

```bash
cd run
pip install -r requirements.txt
python staff.py  # Inicia o servidor administrativo (porta 4999 por padrão)
# Em outro terminal
python backend.py # Inicia o servidor de estudantes (porta 5000 por padrão)
```

**Nota:** Atualmente, o backend possui caminhos de arquivos e banco de dados hardcoded. Verifique o arquivo `run/config.py` e ajuste se necessário.

### 2. Frontend (Next.js Manager)

O frontend administrativo permite gerenciar círculos, questões e alunos.

```bash
cd manager
npm install
cp .env.example .env.local # Ajuste a URL do backend se necessário
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## ⚠️ Problemas Conhecidos e Saúde do Código

O projeto está em fase de modernização. Alguns pontos de atenção:
- **Caminhos Hardcoded**: Muitos scripts apontam para caminhos absolutos (ex: `/home/friend/Dropbox/...`).
- **Segurança**: O controle de acesso por IP é baseado em arquivos externos fixos.
- **Portabilidade**: O banco de dados SQLite é recriado em certos scripts se não houver cuidado.

Para mais detalhes, consulte o arquivo `HEALTH_REPORT.md`.

## Autores

### Equipe atual

- Hylson Vescovi Netto: [hylson.netto@ifc.edu.br](mailto:hylson.netto@ifc.edu.br)

### Contribuidores

- Ricardo de la Rocha Ladeira: [ricardo.ladeira@ifc.edu.br](mailto:ricardo.ladeira@ifc.edu.br)

---

## Como Contribuir

Sinta-se livre para relatar _bugs_, impressões ou sugerir mudanças, tanto por meio da criação de **issues** e **pull requests** quanto pelo contato direto com a [equipe atual](#Equipe-atual). Pedimos apenas que utilize uma linguagem clara, descrevendo o seu ambiente e o passo a passo para reproduzir o _bug_. Seja breve e objetivo, mostrando _prints_ se possível.
