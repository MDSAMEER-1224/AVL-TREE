FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN javac -d out src/main/java/avl/*.java

EXPOSE 8080

CMD ["sh", "-c", "java -cp out avl.Main"]
