FROM alpine
RUN apk add wget --no-cache
RUN wget https://github.com/ammilam/sync-to-gcp/releases/download/latest/sync-to-gcp-alpine-x64
RUN mv sync-to-gcp-alpine-x64 sync-to-gcp
RUN chmod +x sync-to-gcp
RUN mkdir test && echo "help me I am stuck in a docker container" >> ./test/test.txt
CMD ["/bin/bash"]
