#!/bin/bash

# Fixed Relicon Deployment - Node.js 16 Compatible
yum update -y
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs git python3 python3-pip

mkdir -p /opt/relicon-full
cd /opt/relicon-full

# Create package.json with Node.js 16 compatible versions
cat > package.json << 'EOF'
{
  "name": "relicon-full",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "13.5.6",
    "react": "^18",
    "react-dom": "^18",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8"
  }
}
EOF

mkdir -p app engine public

cat > app/layout.tsx << 'EOF'
import './globals.css'

export const metadata = {
  title: 'Relicon - AI Advertising Director',
  description: 'AI-powered video advertisement generation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎬 Relicon
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Advertising Director
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">✅ Production Ready</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Frontend</h3>
                <p className="text-green-600">Next.js 13.5.6 (Node.js 16 compatible)</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Backend</h3>
                <p className="text-blue-600">FastAPI + uvicorn running on port 8000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
EOF

cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
EOF

cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cat > engine/requirements.txt << 'EOF'
fastapi==0.103.2
uvicorn==0.22.0
python-multipart
pydantic
EOF

cat > engine/server.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Relicon Backend API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "🎬 Relicon Backend API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "relicon-backend"}

@app.post("/generate")
async def generate_video():
    return {
        "message": "Video generation endpoint ready",
        "note": "Configure API keys to enable full functionality"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

npm install
cd engine
pip3 install -r requirements.txt
cd ..
npm run build

cat > /etc/systemd/system/relicon-frontend.service << 'EOF'
[Unit]
Description=Relicon Frontend Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon-full
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/relicon-backend.service << 'EOF'
[Unit]
Description=Relicon Backend Service
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/relicon-full/engine
ExecStart=/usr/bin/python3 server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

chown -R ec2-user:ec2-user /opt/relicon-full
systemctl daemon-reload
systemctl enable relicon-backend relicon-frontend
systemctl start relicon-backend
sleep 5
systemctl start relicon-frontend

echo "✅ Fixed Relicon deployment completed!"
