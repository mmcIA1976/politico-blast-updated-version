# Cómo ver la rama `codex/analyze-shooter-game-code-structure` en Windows (PowerShell)

## Resumen rápido
Tu flujo fue correcto. El error inicial:

```powershell
fatal: not a git repository (or any of the parent directories): .git
```

aparece cuando ejecutas comandos de Git fuera de una carpeta clonada.

## Pasos correctos

```powershell
# 1) Clonar el repo
cd C:\Users\MSI
git clone https://github.com/mmcIA1976/politico-blast-updated-version.git

# 2) Entrar al repo (aquí sí existe .git)
cd C:\Users\MSI\politico-blast-updated-version

# 3) Confirmar que la rama remota existe
git branch -r

# 4) Crear rama local desde remoto y cambiarte a ella
git checkout -b codex/analyze-shooter-game-code-structure --track origin/codex/analyze-shooter-game-code-structure
```

## Verificación (para confirmar que ves la versión actualizada)

```powershell
# Debe mostrar la rama codex local activa
git branch --show-current

# Debe estar limpio
git status

# Debe mostrar el commit más reciente de esa rama
git log --oneline -n 1
```

## Nota importante sobre tu comando
Este comando también es válido:

```powershell
git fetch origin codex/analyze-shooter-game-code-structure:codex/analyze-shooter-game-code-structure
```

pero **solo crea/actualiza la rama local**; no te cambia automáticamente a ella.
Después debes ejecutar:

```powershell
git checkout codex/analyze-shooter-game-code-structure
```

## Ejecutar la app para comprobar cambios

```powershell
npm install
npm run build
npm start
```

y abrir `http://localhost:5000`.
