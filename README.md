# GenAI Landscape

> Discover, compare, and understand the tools shaping generative AI.

GenAI Landscape is a full-stack platform that helps developers, creators, and AI enthusiasts discover and evaluate generative AI tools. It collects data from multiple sources, stores it in MongoDB, and uses semantic search with an AI consultant to provide relevant recommendations.

## Features

- Discover tools from Futurepedia, Product Hunt, and Hugging Face
- Filter tools by category, pricing, features, and use case
- View detailed tool profiles and compare tools side by side
- Explore trends and market insights
- Use semantic search for natural-language queries
- Get AI recommendations grounded in retrieved tool data
- Secure accounts with JWT authentication

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Python, FastAPI, Pydantic, Uvicorn
- **Database:** MongoDB Atlas and Atlas Vector Search
- **AI:** Sentence Transformers and Google Gemini API
- **Scraping:** BeautifulSoup, Selenium, Requests

## Installation

### Prerequisites

- Python 3.10+
- Node.js and npm, or Bun
- MongoDB Atlas
- Google Gemini API key

### 1. Configure and run the backend

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
GOOGLE_API_KEY=your_gemini_api_key
```

Then run:

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app:app --reload
```

The API runs at `http://localhost:8000`.

### 2. Install and run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Project Structure

```text
The-GenAi-Landscape/
├── backend/       # FastAPI API, database utilities, and scrapers
├── frontend/      # React dashboard and pages
└── README.md
```

## Data and AI Pipeline

```text
Sources -> Scraping -> Enrichment -> MongoDB
                                      |
                                      v
                           Embeddings and vector search
                                      |
                                      v
                              AI recommendations
```

Tool descriptions and user queries are converted into embeddings with `all-MiniLM-L6-v2`. MongoDB Atlas Vector Search retrieves relevant tools, which are then provided as context to the Gemini-powered consultant.

## Roadmap

- Improve global search and authenticated route protection
- Add requirement-aware ranking for constraints such as `free`, `Flutter`, or `open source`
- Improve chatbot and responsive UI experiences

## Disclaimer

Tool information comes from external sources and may become outdated. Recommendations are decision support, not absolute rankings.