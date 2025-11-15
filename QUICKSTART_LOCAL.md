# 🚀 Quick Start - Local Development

Esta guía te ayudará a ejecutar el proyecto completo en modo local con Anvil.

## Prerequisitos

- [Foundry](https://book.getfoundry.sh/getting-started/installation) instalado
- Node.js 18+ y npm
- Una wallet compatible (MetaMask recomendado)

## Paso 1: Iniciar Anvil (Terminal 1)

```bash
# Desde la raíz del proyecto
./dev-local.sh
```

Esto iniciará Anvil en `http://127.0.0.1:8545` con 10 cuentas pre-financiadas.

**Cuenta por defecto:**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Balance: 10,000 ETH

⚠️ **Mantén esta terminal abierta**

---

## Paso 2: Deploy Smart Contract (Terminal 2)

```bash
# Desde la raíz del proyecto
./deploy-local.sh
```

Este script:
1. Verificará que Anvil esté corriendo
2. Compilará y deployará `ScoreRegistry.sol`
3. Mostrará el address del contrato deployado

**Copia el contract address** que aparece en el output:
```
ScoreRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

## Paso 3: Configurar Frontend

```bash
cd frontend

# Crear archivo de configuración
cp .env.local.example .env.local
```

Edita `frontend/.env.local` y actualiza el contract address:
```env
NEXT_PUBLIC_SCORE_REGISTRY_ADDRESS=<ADDRESS_FROM_STEP_2>
```

---

## Paso 4: Instalar Dependencias y Ejecutar Frontend

```bash
# Dentro de /frontend
npm install
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

---

## Paso 5: Conectar MetaMask a Anvil

### Opción A: Agregar Red Manualmente

1. Abre MetaMask
2. Click en el selector de red → "Add Network" → "Add a network manually"
3. Configura:
   - **Network Name**: Anvil Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: ETH
4. Guarda

### Opción B: Dejar que RainbowKit lo haga

El frontend detectará automáticamente la red local y te permitirá conectarte.

---

## Paso 6: Importar Cuenta de Prueba en MetaMask

Para tener ETH de prueba inmediatamente:

1. MetaMask → Cuenta → "Import Account"
2. Pega la private key de Anvil:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. ✅ Tendrás 10,000 ETH para pruebas

---

## Paso 7: Probar el Flujo Completo

1. Visita `http://localhost:3000`
2. Conecta tu wallet (asegúrate de estar en Anvil Local - Chain 31337)
3. Click en "Calculate Score"
4. Deberías ver tu credit score calculado

---

## 🧪 Verificar que Todo Funcione

### Test 1: Smart Contract
```bash
cd contracts
forge test
```
Deberías ver: ✅ `8 tests passed`

### Test 2: Contract en Anvil
```bash
# Consultar el contrato deployado
cast call <CONTRACT_ADDRESS> "isScoreValid(address)(bool)" <YOUR_ADDRESS> --rpc-url http://127.0.0.1:8545
```

### Test 3: Frontend
1. Conecta wallet
2. Abre DevTools (F12) → Console
3. No debería haber errores de conexión con el contrato

---

## 🔄 Restart desde Cero

Si algo sale mal:

```bash
# 1. Detén Anvil (Ctrl+C en Terminal 1)
# 2. Detén Frontend (Ctrl+C en Terminal 3)
# 3. Reinicia Anvil
./dev-local.sh

# 4. Re-deploy (el address cambiará)
./deploy-local.sh

# 5. Actualiza .env.local con el nuevo address
# 6. Reinicia frontend
cd frontend && npm run dev
```

---

## 📝 Notas Importantes

- **Anvil reinicia** cada vez que lo detienes → los datos se pierden
- **Contract address cambia** cada vez que re-deployeas
- **Transacciones son instantáneas** (no hay tiempo de bloque real)
- **Gas price es 0** en local (gratis)

---

## 🐛 Troubleshooting

### Error: "Cannot connect to wallet"
- Asegúrate de estar en la red "Anvil Local" (31337)
- Verifica que MetaMask esté conectado a `http://127.0.0.1:8545`

### Error: "Contract not found"
- Verifica que el address en `.env.local` sea correcto
- Re-deploya el contrato si reiniciaste Anvil

### Error: "Nonce too high"
- Resetea la cuenta en MetaMask: Settings → Advanced → Clear activity tab data

---

## ✅ Checklist de Éxito

- [ ] Anvil corriendo en puerto 8545
- [ ] Smart contract deployado con address visible
- [ ] Frontend corriendo en localhost:3000
- [ ] MetaMask conectado a Anvil Local (31337)
- [ ] Wallet conectada en el frontend
- [ ] Score se calcula sin errores

---

## 🚀 Próximos Pasos

Una vez que todo funcione localmente:
1. ✅ Integrar Arkiv SDK
2. ✅ Integrar Hyperbridge
3. ✅ Integrar xx.network
4. Deploy a testnets públicas

---

**¿Todo funcionando?** ¡Perfecto! Ahora estás listo para agregar las integraciones de Arkiv, Hyperbridge y xx.network.
