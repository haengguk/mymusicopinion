# 1. Build 단계 (eclipse-temurin JDK 사용)
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src
# gradlew의 Windows 줄바꿈 문자(CRLF)를 Linux용(LF)으로 변경
RUN sed -i 's/\r$//' gradlew
# 실행 권한 부여
RUN chmod +x ./gradlew
# 빌드 (테스트 제외, 메모리 절약을 위해 데몬 사용 안 함)
RUN ./gradlew bootJar -x test --no-daemon

# 2. Run 단계 (가벼운 JRE 사용)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# 빌드된 jar 파일 복사
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]