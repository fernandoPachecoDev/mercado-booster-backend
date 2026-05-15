FROM node:20-slim

# Instalamos ferramentas de rede para o caso de precisarmos de debug
RUN apt-get update && apt-get install -y iputils-ping dnsutils

WORKDIR /app

# Copiamos os arquivos de dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instalamos as dependências
RUN npm install

# Copiamos o restante dos arquivos do projeto
COPY . .

# Expõe a porta que o Express vai usar
EXPOSE 3000

# Comando para iniciar o servidor em modo desenvolvimento
CMD ["npm", "run", "dev"]