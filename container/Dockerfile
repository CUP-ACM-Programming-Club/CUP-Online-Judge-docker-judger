FROM alpine:latest
MAINTAINER RyanLee <gxlhybh@gmail.com>
ENV JAVA_HOME=/usr/lib/jvm/default-jvm \
    FPC_VERSION="3.0.4" \
    FPC_ARCH="x86_64-linux"
RUN apk add --update \
    python \
	python3 \
    python-dev \
    py-pip \
    build-base \
    gcc \
    g++ \
    nodejs \
    openjdk8 \
    vim
RUN ln -sf "${JAVA_HOME}/bin/"* "/usr/bin/" && \
	apk add binutils && \
    cd /tmp && \
    wget ftp://freepascal.stack.nl/pub/mirrors/fpc/dist/${FPC_VERSION}/${FPC_ARCH}/fpc-${FPC_VERSION}.${FPC_ARCH}.tar && \
    tar xf fpc-${FPC_VERSION}.${FPC_ARCH}.tar && \
    cd fpc-${FPC_VERSION}.${FPC_ARCH} && \
    rm demo* doc* && \
    echo -e '/usr\nN\nN\nN\n' | sh ./install.sh && \
    cd .. && \
    rm -r /tmp/* && \
    rm /var/cache/apk/* && \
	adduser sandbox -u 1111 -h /sandbox -D
COPY sandbox.cpp python2.cpp python3.cpp nodejs.cpp /home/
RUN g++ -o /usr/bin/sandbox /home/sandbox.cpp -O2 && \
	g++ -o /sandbox/python2 /home/python2.cpp -O2 && \
	g++ -o /sandbox/python3 /home/python3.cpp -O2 && \
	g++ -o /sandbox/nodejs /home/nodejs.cpp -O2 && \
	touch /sandbox/data.in
CMD while true; do sleep 1; done
