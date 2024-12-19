FROM denoland/deno

WORKDIR /app

COPY package.json .

RUN deno install

RUN deno install -g npm:serve

COPY . .

RUN deno run build

EXPOSE 3000


CMD [ "deno", "run", "serve" ]
