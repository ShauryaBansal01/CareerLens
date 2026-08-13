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

# Alpine ships almost no fonts, so PDFBox substituted a fallback face for the
# standard-14 (Helvetica, Times) on every uploaded resume. That matters here
# beyond appearance: column detection measures glyph X positions, and a
# substituted face has different metrics than the one the PDF asked for.
# Liberation is metric-compatible with the Helvetica/Arial family, so the
# positions PDFBox reports now match what the document intended.
#
# This does not eliminate the first-request font scan (~70ms) — PDFBox builds
# its own cache lazily and there is no supported way to prime it at build time.
RUN apk add --no-cache ttf-dejavu ttf-liberation fontconfig

# Never run as root. The home directory must exist and be writable: PDFBox
# caches its font scan in $HOME/.pdfbox.cache, and when it cannot write there it
# repeats the full scan on every request rather than just the first.
RUN addgroup -S app && adduser -S app -G app -h /home/app \
 && mkdir -p /home/app && chown -R app:app /home/app
ENV HOME=/home/app

USER app
RUN fc-cache -f > /dev/null 2>&1

COPY --from=build /app/target/pdf-service-*.jar app.jar

EXPOSE 8080

# MaxRAMPercentage rather than a fixed -Xmx: containers get a memory limit at
# run time, and the JVM should size its heap against that rather than the host's
# total RAM.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-XX:+UseSerialGC", "-jar", "app.jar"]
