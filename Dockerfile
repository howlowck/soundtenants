FROM denoland/deno:1.13.2

# The port that your application listens to.
EXPOSE 8080

WORKDIR /app

RUN deno install -qAn vr https://deno.land/x/velociraptor@1.2.0/cli.ts

# Prefer not to run as root.
# USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.

# ADD src/deps.ts ./src
# RUN deno cache src/deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --unstable src/index.ts

# CMD ["run","--unstable", "--allow-run", "--allow-read", "--allow-write", "--allow-net", "--allow-hrtime", "src/index.ts"]