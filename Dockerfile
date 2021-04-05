FROM hayd/alpine-deno:1.8.1

WORKDIR /blog
COPY src/deps.ts .
RUN deno cache --unstable deps.ts

ADD src/ ./
RUN deno cache --unstable app.ts

ADD healthcheck.ts ./
HEALTHCHECK --interval=10s --timeout=3s \ 
    CMD deno run --allow-net --allow-env healthcheck.ts 

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "--unstable", "--watch", "app.ts"]