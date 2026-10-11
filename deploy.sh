#!/bin/bash
# =========================================================
# FORTflix - Script de Instalação e Deploy Automático para VPS
# Host: vps69175.publiccloud.com.br (177.153.33.245)
# =========================================================

echo "========================================================="
echo "   Iniciando Instalação do FORTflix na VPS              "
echo "   Servidor: vps69175.publiccloud.com.br (177.153.33.245) "
echo "========================================================="

# 1. Atualizar repositórios do sistema
echo "1/5: Atualizando pacotes do sistema..."
sudo apt update -y && sudo apt upgrade -y

# 2. Instalar dependências essenciais (Git, Curl, Docker, Nginx ou Node)
echo "2/5: Verificando e instalando Docker & Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo systemctl enable --now docker
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Instalando Docker Compose..."
    sudo apt install -y docker-compose
fi

# 3. Parar containers antigos se existirem
echo "3/5: Parando containers anteriores..."
docker-compose down 2>/dev/null || true

# 4. Construir e subir a aplicação FORTflix
echo "4/5: Compilando e iniciando os containers do FORTflix..."
docker-compose up -d --build

# 5. Conclusão
echo "========================================================="
echo "   FORTflix Instalado e Rodando com Sucesso!            "
echo "   Acesse: http://177.153.33.245                         "
echo "   Ou: http://vps69175.publiccloud.com.br                "
echo "========================================================="
