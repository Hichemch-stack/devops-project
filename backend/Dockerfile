# Stage 1: Build Spring Boot app
FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

COPY . .

RUN ./mvnw clean package -DskipTests

# Stage 2: Run Spring Boot app
FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar ./backend.jar

EXPOSE 8080

CMD ["java", "-jar", "backend.jar"]

