FROM alpine:latest
RUN /bin/sh -c "apk add --no-cache bash wget"
RUN exec /bin/bash
RUN wget https://github.com/ammilam/sync-to-gcp/releases/download/latest/sync-to-gcp-alpine-x64
RUN mv sync-to-gcp-alpine-x64 sync-to-gcp
RUN chmod +x sync-to-gcp
RUN mkdir test && echo "help me I am stuck in a docker container" >> ./test/test.txt
ENTRYPOINT [ "/bin/bash", "-c", "--" ]
