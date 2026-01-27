# ========================================
# Stage 1 — Build Frontend Angular
# ========================================
FROM node:22 AS frontend-build

WORKDIR /app/frontend

# Copier package.json et package-lock.json pour le cache npm
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du frontend
COPY frontend/ .

# Build production Angular
RUN npx ng build frontend --configuration production

# ========================================
# Stage 2 — Build Backend Spring Boot
# ========================================
FROM eclipse-temurin:17-jdk-jammy AS backend-build

WORKDIR /app/backend

# Copier Maven Wrapper et fichiers pom.xml
COPY backend/mvnw backend/pom.xml backend/.mvn ./ 

# Copier le reste du backend
COPY backend/src ./src

# Rendre Maven Wrapper exécutable
RUN chmod +x mvnw

# Build Spring Boot JAR (skip tests pour accélérer)
RUN ./mvnw clean package -DskipTests

# ========================================
# Stage 3 — Image finale (light)
# ========================================
FROM nginx:alpine

# Copier le frontend build dans nginx
COPY --from=frontend-build /app/frontend/dist/frontend /usr/share/nginx/html

# Copier le backend JAR dans /app
COPY --from=backend-build /app/backend/target/backend-0.0.1-SNAPSHOT.jar /app/backend.jar

# Exposer les ports : Angular via Nginx (80) et backend (8080)
EXPOSE 80 8080

# Démarrage Nginx + backend
# Note : pour simplifier, on peut démarrer les deux avec un petit script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

