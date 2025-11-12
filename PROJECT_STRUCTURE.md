# Relicon Project Structure

## 📁 Root Directory

```
relicon-full/
├── app/                    # Next.js App Router
├── components/             # React components
├── engine/                 # Python AI backend
├── lib/                    # Utility libraries
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── styles/                 # CSS styles
├── hooks/                  # React hooks
├── contexts/               # React contexts
├── deployment/             # Deployment scripts
├── docs/                   # Documentation
├── package.json            # Node.js dependencies
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── .env.example            # Environment template
├── .env.local              # Local environment (gitignored)
├── .env.production         # Production environment (gitignored)
├── server.js               # Production server
├── start.sh                # Development startup script
└── README.md               # Main documentation
```

## 🎯 Key Directories

### `/app` - Frontend Application
- Next.js 14 App Router structure
- Pages, layouts, and API routes
- Dashboard, studio, and authentication

### `/engine` - AI Backend
- FastAPI Python server
- AI service integrations (OpenAI, Luma, ElevenLabs)
- Video generation pipeline
- Job management system

### `/components` - UI Components
- Reusable React components
- Shadcn/ui component library
- Custom dashboard components

### `/deployment` - Deployment Scripts
- AWS deployment automation
- Server setup scripts
- Monitoring and management tools

### `/docs` - Documentation
- Setup guides
- Deployment instructions
- API documentation

## 🚀 Quick Start

1. **Install dependencies**: `pnpm install`
2. **Set up environment**: Copy `.env.example` to `.env.local`
3. **Start development**: `./start.sh`
4. **Deploy to AWS**: `./deployment/deploy.sh`

## 📝 Environment Files

- `.env.example` - Template with all required variables
- `.env.local` - Local development (gitignored)
- `.env.production` - Production deployment (gitignored)
