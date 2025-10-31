<#
  run.ps1 - Script para rodar o projeto localmente (Windows PowerShell)

  O que faz:
  - copia .env.example para .env se não existir
  - inicia/cria o container postgres-quiz (com credenciais usadas no projeto)
  - instala dependências se necessário
  - compila TypeScript
  - inicia a aplicação (production via dist)

  Use: Execute no PowerShell a partir da raiz do projeto:
    .\run.ps1
#>

Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

Write-Host "Raiz do projeto: $root"

# 1) Cria .env se não existir
$envFile = Join-Path $root '.env'
if (-not (Test-Path $envFile)) {
  Copy-Item -Path (Join-Path $root '.env.example') -Destination $envFile -Force
  Write-Host ".env criado a partir de .env.example"
} else {
  Write-Host ".env já existe"
}

# 2) Gerencia container Postgres (nome: postgres-quiz)
try {
  $exists = docker ps -a --filter "name=postgres-quiz" --format "{{.Names}}" 2>$null
} catch {
  Write-Host "Docker não parece estar disponível na PATH. Certifique-se de que o Docker Desktop está instalado e rodando." -ForegroundColor Yellow
  Pop-Location
  exit 1
}

if (-not $exists) {
  Write-Host "Criando e iniciando container postgres-quiz..."
  docker run --name postgres-quiz -e POSTGRES_USER=type -e POSTGRES_PASSWORD=102030 -e POSTGRES_DB=quiz_db -p 5432:5432 -d postgres | Out-Null
  Start-Sleep -Seconds 2
  Write-Host "Container criado. Dê alguns segundos para o Postgres inicializar." -ForegroundColor Green
} else {
  $running = docker ps --filter "name=postgres-quiz" --format "{{.Names}}" 2>$null
  if (-not $running) {
    Write-Host "Iniciando container postgres-quiz..."
    docker start postgres-quiz | Out-Null
    Start-Sleep -Seconds 1
    Write-Host "Container iniciado." -ForegroundColor Green
  } else {
    Write-Host "Container postgres-quiz já está rodando." -ForegroundColor Green
  }
}

# 3) Instala dependências se necessário
if (-not (Test-Path (Join-Path $root 'node_modules'))) {
  Write-Host "Instalando dependências (npm install)..."
  npm install
}

# 4) Compila TypeScript e inicia
Write-Host "Compilando TypeScript (npm run build)..."
npm run build

Write-Host "Iniciando aplicação (npm start)..."
npm start

Pop-Location