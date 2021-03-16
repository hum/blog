FROM hayd/alpine-deno:1.8.1

WORKDIR /blog

#COPY deps.ts .
#RUN deno cache --unstable deps.ts

ADD ./ ./
#RUN deno cache --unstable app.ts
#CMD ["deno compile --unstable --output blog --allow-read --allow-write --allow-net app.ts"]
RUN deno compile --unstable --output blog --allow-net --allow-read --allow-write --allow-env app.ts
RUN ./blog
#CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-write", "--unstable", "app.ts"]
#CMD ["deno run", 
#        "--allow-net",
#        "--allow-read",
#        "--allow-write",
#        "--allow-env",
#       "--unstable",
#        "app.ts"]