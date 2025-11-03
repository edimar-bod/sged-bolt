# Sistema de Gestión de Eventos Deportivos (SGED)

Sistema web para gestionar torneos deportivos conforme al Reglamento General de Competiciones de la Federación Venezolana de Fútbol (FVF).

## Características Principales

- **Gestión de Partidos**: Editar resultados en tiempo real
- **Calendario**: Ver enfrentamientos por jornada
- **Tabla de Posiciones**: Cálculo automático según normativa FVF
- **Auditoría**: Registro completo de cambios
- **Roles de Usuario**: Admin, User, Viewer
- **Sincronización en Tiempo Real**: Actualización automática para todos los usuarios
- **Conforme a FVF**: Puntuación (3-1-0) y criterios de desempate oficiales

## Configuración de la Base de Datos

### 1. Acceder a Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a **SQL Editor**

### 2. Ejecutar el Script SQL

1. Abre el archivo `database-setup.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** para ejecutar

Esto creará:
- Todas las tablas necesarias (tournament_config, matches, standings, audit_log, user_roles)
- Índices para mejor rendimiento
- Políticas de seguridad RLS
- Datos de ejemplo para comenzar

### 3. Configurar Autenticación

1. En Supabase, ve a **Authentication** → **Settings**
2. En **Email Auth**, asegúrate de que esté habilitado
3. Desactiva **Confirm Email** (para facilitar el desarrollo)

### 4. Crear Usuario Administrador

1. Ejecuta la aplicación y crea tu primera cuenta
2. Ve a Supabase → **Authentication** → **Users**
3. Copia el **User ID** de tu usuario
4. Ve al **SQL Editor** y ejecuta:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('TU_USER_ID_AQUI', 'admin');
```

O si ya existe el registro:

```sql
UPDATE user_roles
SET role = 'admin'
WHERE user_id = 'TU_USER_ID_AQUI';
```

## Instalación y Ejecución

### Instalar dependencias

```bash
npm install
```

### Verificar variables de entorno

El archivo `.env` ya está configurado con:
```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### Ejecutar en desarrollo

```bash
npm run dev
```

### Compilar para producción

```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Navegación y selector de grupo
│   ├── MatchCard.tsx   # Tarjeta de partido individual
│   ├── JornadaTab.tsx  # Pestaña de edición de resultados
│   ├── CalendarioTab.tsx # Pestaña de calendario
│   ├── TablaTab.tsx    # Pestaña de tabla de posiciones
│   └── AuthModal.tsx   # Modal de autenticación
├── hooks/
│   └── useAuth.ts      # Hook de autenticación
├── lib/
│   └── supabase.ts     # Cliente y tipos de Supabase
├── utils/
│   └── standings.ts    # Cálculos de tabla según FVF
└── App.tsx             # Componente principal
```

## Uso del Sistema

### Roles de Usuario

**Administrador (admin)**
- Editar resultados de partidos
- Ver tabla de posiciones
- Ver calendario
- Acceso completo al sistema

**Usuario (user)**
- Ver todos los datos
- Sin permisos de edición

**Visitante (viewer)**
- Solo visualización
- Sin permisos de edición

### Flujo de Trabajo

1. **Iniciar Sesión**: Los usuarios deben autenticarse
2. **Seleccionar Grupo**: A, B, o C
3. **Seleccionar Pestaña**: Jornada, Calendario, o Tabla

#### Pestaña Jornada
- Ver todos los partidos organizados por jornada
- Editar resultados (solo admin)
- Validación automática (0-99 goles)
- Guardado con confirmación visual

#### Pestaña Calendario
- Selector de jornada
- Ver todos los enfrentamientos
- Información de fecha, hora y cancha
- Ver resultados finales

#### Pestaña Tabla
- Tabla de posiciones actualizada en tiempo real
- Ordenamiento automático según FVF:
  1. Puntos (descendente)
  2. Diferencia de goles (descendente)
  3. Goles a favor (descendente)
- Responsive (oculta columnas en móvil)
- Indicadores visuales para diferencia de goles

## Criterios FVF Implementados

### Sistema de Puntuación
- Victoria: 3 puntos
- Empate: 1 punto
- Derrota: 0 puntos

### Criterios de Desempate (Orden Estricto)
1. **Puntos totales** (PTS) - descendente
2. **Diferencia de goles** (DIF = GF - GC) - descendente
3. **Goles a favor** (GF) - descendente

### Validaciones
- Scores: 0-99 (enteros, no negativos)
- Auditoría completa de cambios
- Incomparecencias marcadas
- Sincronización en tiempo real

## Agregar Más Datos

### Agregar Partidos

```sql
INSERT INTO matches (
  match_id, grupo, jornada, numero,
  equipo_local, equipo_visitante,
  cancha, fecha, hora
) VALUES (
  'j2-1', 'A', 2, 1,
  'Dorado Citty', 'CASAGRANDE',
  'Estadio El Dorado', '2024-06-07', '18:00'
);
```

### Agregar Equipos a un Grupo

```sql
UPDATE tournament_config
SET equipos_a = array_append(equipos_a, 'NUEVO EQUIPO');
```

## Características Técnicas

- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Validación**: Cliente y servidor
- **Responsive**: Mobile, Tablet, Desktop

## Soporte

Para problemas o preguntas sobre el sistema, contacta con la Fundación Corazón de Azúcar.

## Licencia

© 2024 Fundación Corazón de Azúcar. Todos los derechos reservados.
