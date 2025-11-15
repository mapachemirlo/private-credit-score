# 🚀 Quick Start - 5 Minutos

## Prerrequisitos
- Node.js 20+
- Foundry (forge)
- MetaMask o cualquier wallet

## Paso 1: Clonar y Setup (1 min)

```bash
# Ya estás en el proyecto
cd /Users/clau/Development/Web3/hackathon-subcero

# Instalar dependencias frontend (si no está hecho)
cd frontend
npm install
```

## Paso 2: Configurar Variables de Entorno (2 min)

### Frontend
```bash
cd frontend
cp .env.local.example .env.local
```

Edita `.env.local` y agrega tu WalletConnect Project ID:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_aqui
```

**Obtener WalletConnect ID**: https://cloud.walletconnect.com (gratis, 1 minuto)

### Contracts (Opcional - solo si vas a deployar)
```bash
cd contracts
cp .env.example .env
# Agregar private key y RPC URLs si necesitas deployar
```

## Paso 3: Ejecutar Tests de Contratos (30 seg)

```bash
cd contracts
forge test
```

Deberías ver:
```
Ran 6 tests for test/ScoreRegistry.t.sol:ScoreRegistryTest
[PASS] testUpdateScore() ✓
[PASS] testScoreExpiration() ✓
... (todos passing)
```

## Paso 4: Iniciar Frontend (30 seg)

```bash
cd frontend
npm run dev
```

Abre http://localhost:3000

## Paso 5: Probar la App (1 min)

1. **Connect Wallet** → Click botón superior derecho
2. **Selecciona tu wallet** → MetaMask/WalletConnect
3. **Cambia a Sepolia** (o cualquier testnet soportada)
4. **Click "Calculate Score"** → Verás tu score calculado
5. **Explora el breakdown** → Loan history, liquidation avoidance, etc.

---

## ✅ ¡Listo!

Tienes el proyecto corriendo localmente. 

## Siguientes Pasos

### Para el Hackathon
1. **Deploy Contracts** → Sigue `/docs/DEPLOYMENT.md`
2. **Crear Demo Video** → Graba la demo de 3 minutos
3. **Subir a GitHub** → Push tu código
4. **Deploy Frontend** → Vercel (5 min)

### Para Desarrollo
1. **Integrar The Graph** → Ver `/docs/ARCHITECTURE.md`
2. **Agregar Hyperbridge** → SDK en `backend/`
3. **Implementar xx.network** → Privacy layer
4. **Setup Arkiv** → Time-scoped storage

---

## Troubleshooting Rápido

### Error: "Cannot find module wagmi"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Wallet won't connect"
- Verifica que estés en una red soportada (Sepolia, Arbitrum Sepolia, etc.)
- Limpia cache del navegador
- Recarga la página

### Error: "Forge not found"
```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## Estructura del Proyecto

```
hackathon-subcero/
├── contracts/           # Smart contracts (Foundry)
│   ├── src/
│   │   └── ScoreRegistry.sol
│   └── test/
│       └── ScoreRegistry.t.sol
├── frontend/           # Next.js app
│   ├── app/
│   │   ├── page.tsx           # Main page
│   │   └── api/calculate-score/
│   ├── components/
│   │   └── ScoreCalculator.tsx
│   └── lib/
│       ├── wagmi.ts           # Web3 config
│       └── providers.tsx
├── docs/              # Documentation
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── EXECUTIVE_SUMMARY.md
└── README.md
```

---

## Comandos Útiles

```bash
# Frontend
cd frontend
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Iniciar producción

# Contracts
cd contracts
forge build          # Compilar
forge test           # Tests
forge test -vvv      # Tests verbose
forge fmt            # Format código

# Deploy (con .env configurado)
forge script script/Deploy.s.sol:Deploy --rpc-url sepolia --broadcast
```

---

## 📚 Más Info

- **Arquitectura Completa**: `/docs/ARCHITECTURE.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **Executive Summary**: `/docs/EXECUTIVE_SUMMARY.md`

---

## 🎯 Demo en 30 Segundos

1. Abre app → http://localhost:3000
2. Connect wallet (cualquier address)
3. Click "Calculate Score"
4. Muestra el dashboard con score breakdown
5. Explica: "Cross-chain, private, time-scoped scoring"

**¡Eso es todo! Ya tienes un MVP funcional para tu hackathon.** 🚀
