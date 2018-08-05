#!/bin/sh
# usage:   program <DIR>
# example: program /tmp/out

if [ $# -ge 1 ]
then
    DIR=$1
else
    DIR=.
fi

for i in `seq 1 10`; do
    uuid=$(uuidgen)

    pub=es256_$uuid.pem
    priv=es256_$uuid-priv.pem

    openssl ecparam -name secp256k1 -genkey -noout -out $DIR/keys/$priv 
    openssl ec -in $DIR/keys/$priv -pubout -out $DIR/keys/$pub

done
