# 1. Build 단계 (eclipse-temurin JDK 사용)
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src
# 실행 권한 부여
RUN chmod +x ./gradlew
# 빌드 (테스트 제외)
RUN ./gradlew bootJar -x test

# 2. Run 단계 (가벼운 JRE 사용)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# 빌드된 jar 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]