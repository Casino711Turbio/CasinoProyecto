# 🎰 CasinoProyecto

Sistema de gestión integral para casino virtual. Backend Django REST Framework con jugadores, juegos, membresías VIP, transacciones multi-moneda y códigos QR.

---

## 🎯 ¿Qué hace?

| Módulo | Funcionalidad |
|--------|---------------|
| 👤 **Jugadores** | Registro, perfil, balance, códigos QR de identificación |
| 🎲 **Juegos** | Catálogo de juegos y sesiones con apuestas/ganancias |
| 💰 **Transacciones** | Depósitos, retiros, ganancias, pérdidas, cancelaciones con doble autorización |
| 🏅 **Membresías** | Sistema VIP: Bronce → Plata → Oro → Platino → VIP |
| 🔐 **Autenticación** | JWT con backend personalizado |
| 🌎 **Multi-moneda** | USD, EUR, MXN |
| 🚦 **Límites** | Control de límites por jugador: diario, semanal, mensual |

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────┐
│              Django REST Framework            │
│                  (Backend)                    │
├──────────┬──────────┬───────────┬────────────┤
│   Auth   │  Games   │  Players  │Transactions│
│  (JWT)   │          │           │            │
├──────────┴──────────┴───────────┴────────────┤
│              Memberships (VIP)                │
│     Bronce → Plata → Oro → Platino → VIP     │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Django + Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| DB | PostgreSQL (producción) / SQLite (desarrollo) |
| QR | qrcode (PIL/Pillow) |
| CORS | django-cors-headers |

---

## 📦 Apps del proyecto

```
backend/
├── casino_project/          # Configuración principal Django
├── apps/
│   ├── authentication/      # JWT, login, registro
│   ├── games/               # Catálogo y sesiones de juego
│   ├── players/             # Perfil, balance, QR
│   ├── memberships/         # Planes VIP + historial
│   └── transactions/        # Depósitos, retiros, límites, cancelaciones
```

---

## 🚀 Quick Start

```bash
# 1. Clonar
git clone https://github.com/Casino711Turbio/CasinoProyecto.git
cd CasinoProyecto

# 2. Entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Instalar dependencias
cd backend
pip install -r requirements.txt

# 4. Migraciones
python manage.py migrate

# 5. Datos demo
python manage.py load_games
python manage.py load_memberships

# 6. Iniciar servidor
python manage.py runserver
```

API disponible en `http://localhost:8000/api/`

---

## 📡 Endpoints principales

### 🔐 Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/login/` | Iniciar sesión (JWT) |
| `POST` | `/api/auth/register/` | Registrar nuevo usuario |
| `POST` | `/api/auth/refresh/` | Refrescar token |

### 👤 Players
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/players/` | Listar jugadores |
| `POST` | `/api/players/` | Crear jugador (genera QR automático) |
| `GET` | `/api/players/{id}/` | Detalle + balance + QR |

### 🎲 Games
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/games/` | Catálogo de juegos |
| `POST` | `/api/games/sessions/` | Iniciar sesión de juego |
| `PATCH` | `/api/games/sessions/{id}/` | Finalizar sesión (resultado, ganancia) |

### 💰 Transactions
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/transactions/` | Crear transacción |
| `GET` | `/api/transactions/` | Listar transacciones |
| `POST` | `/api/transactions/{id}/cancel/` | Solicitar cancelación |
| `POST` | `/api/transactions/{id}/authorize/` | Autorizar transacción |

### 🏅 Memberships
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/memberships/plans/` | Planes disponibles |
| `GET` | `/api/memberships/{player_id}/` | Membresía del jugador |
| `GET` | `/api/memberships/{player_id}/history/` | Historial de cambios de tier |

---

## 💡 Flujo principal

```
1. Jugador se registra → recibe QR único
         │
2. Deposita fondos → balance se actualiza
         │
3. Elige juego → inicia GameSession
         │         ├── Apuesta (bet_amount)
         │         └── Resultado → ganancia/pérdida
         │
4. Volumen de juego ↑ → sube de tier VIP
         │
5. Puede retirar fondos → transacción withdrawal
```

---

## 🛡️ Seguridad y control

| Mecanismo | Implementación |
|-----------|---------------|
| **Límites por jugador** | Diario, semanal, mensual por tipo de transacción |
| **Doble autorización** | Transacciones grandes requieren 2 aprobadores |
| **Cancelaciones** | Con historial de auditoría y doble autorización |
| **QR único** | Cada jugador tiene código QR generado automáticamente |
| **Multi-canal** | Web, Móvil, Terminal, API — registrado por transacción |

---

## 🧑‍💻 Autores

**Equipo Casino711Turbio**
- GitHub: [@Casino711Turbio](https://github.com/Casino711Turbio)
- Proyecto universitario — Sistema de gestión de casino
