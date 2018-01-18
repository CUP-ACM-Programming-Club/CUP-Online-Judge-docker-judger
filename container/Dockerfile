FROM alpine:latest
MAINTAINER RyanLee <gxlhybh@gmail.com>
ENV JAVA_HOME=/usr/lib/jvm/default-jvm \
    FPC_VERSION="3.0.4" \
    FPC_ARCH="x86_64-linux" \
    KOTLIN_VERSION=1.2.20 \
    KOTLIN_HOME=/usr/share/kotlin
COPY lua.cpp kotlin.cpp  \
#    fpc-3.0.4.x86_64-linux.tar kotlin-compiler-1.2.20.zip \
     lua.sh sandbox.cpp python2.cpp python3.cpp nodejs.cpp compile.cpp java.cpp \
     csharp.cpp java0.policy /home/
RUN cd /home/ && \
    wget "ftp://gd.tuwien.ac.at/languages/pascal/fpc/dist/${FPC_VERSION}/${FPC_ARCH}/fpc-${FPC_VERSION}.${FPC_ARCH}.tar" && \
    wget "https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip" && \
    cd / && \
    echo "@testing http://dl-4.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
    apk add --update \
    python \
	python3 \
    python-dev \
    py-pip \
    build-base \
    gcc \
    g++ \
    lua \
    php7 \
    clang \
    ruby \
    perl \
    go \
    ghc \
    nodejs \
    openjdk8 \
    vim \
    mono@testing && \
    adduser sandbox -u 1111 -h /sandbox -D && \
    ln -sf "${JAVA_HOME}/bin/"* "/usr/bin/" && \
	apk add binutils && \
	mv /home/fpc-3.0.4.x86_64-linux.tar /tmp/ && \
    cd /tmp && \
    tar xf fpc-${FPC_VERSION}.${FPC_ARCH}.tar && \
    cd fpc-${FPC_VERSION}.${FPC_ARCH} && \
    rm demo* doc* && \
    echo -e '/usr\nN\nN\nN\n' | sh ./install.sh && \
    cd .. && \
    rm -r /tmp/* && \
    rm /var/cache/apk/* && \
    rm -rf /var/cache/apk/* && \
    apk add --update bash && \
    apk add --virtual=build-dependencies wget ca-certificates && \
    cd /tmp && \
    mv /home/kotlin-compiler-${KOTLIN_VERSION}.zip /tmp/ &&\
    unzip "kotlin-compiler-${KOTLIN_VERSION}.zip" && \
    mkdir "${KOTLIN_HOME}" && \
    rm "/tmp/kotlinc/bin/"*.bat && \
    mv "/tmp/kotlinc/bin" "/tmp/kotlinc/lib" "${KOTLIN_HOME}" && \
    ln -s "${KOTLIN_HOME}/bin/"* "/usr/bin/" && \
    apk del build-dependencies && \
    rm -rf /tmp/* /var/cache/apk/* && \
    cd / && \
    mv /home/lua.sh /sandbox/ && \
    chmod a+x /sandbox/lua.sh && \
    g++ -o /usr/bin/sandbox /home/sandbox.cpp -O2 && \
	g++ -o /sandbox/python2 /home/python2.cpp -O2 && \
	g++ -o /sandbox/python3 /home/python3.cpp -O2 && \
	g++ -o /sandbox/nodejs /home/nodejs.cpp -O2 && \
	g++ -o /sandbox/compile /home/compile.cpp -O2 && \
	g++ -o /sandbox/java /home/java.cpp -O2 && \
	g++ -o /sandbox/csharp /home/csharp.cpp -O2 && \
	g++ -o /sandbox/lua /home/lua.cpp -O2 && \
    g++ -o /sandbox/kotlin /home/kotlin.cpp -O2 && \
	touch /sandbox/data.in
CMD while true; do sleep 1; done
