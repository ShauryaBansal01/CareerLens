# ── Build ──────────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Dependencies resolve in their own layer, so editing source does not re-download
# the world on every build.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

# ── Run ────────────────────────────────────────────────────────────────────
# JRE, not JDK: the compiler is not needed at runtime and roughly halves the image.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Never run as root.
RUN addgroup -S app && adduser -S app -G app
USER app

COPY --from=build /app/target/pdf-service-*.jar app.jar

EXPOSE 8080

# MaxRAMPercentage rather than a fixed -Xmx: containers get a memory limit at
# run time, and the JVM should size its heap against that rather than the host's
# total RAM.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseSerialGC", "-jar", "app.jar"]
