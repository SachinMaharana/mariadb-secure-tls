# Mariadb SSL and secure connections from clients

## Install MariaDB (Ubuntu 18.04)

```bash
root@mk:~# apt update -y

root@mk:~# apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8

root@mk:~# add-apt-repository "deb [arch=amd64,arm64,ppc64el] http://mariadb.mirror.liquidtelecom.com/repo/10.4/ubuntu $(lsb_release -cs) main"

root@mk:~# apt update

root@mk:~# apt -y install mariadb-server mariadb-client
```

## MariaDB Setup

```bash
root@mk:~# mysql_secure_installation

root@mk:~# mysql -u root -p

MariaDB [(none)]> SELECT VERSION();
+--------------------------------------------+
| VERSION()                                  |
+--------------------------------------------+
| 10.4.18-MariaDB-1:10.4.18+maria~bionic-log |
+--------------------------------------------+
1 row in set (0.001 sec)

```

## Install mkcert (self-signed certificates)

https://github.com/FiloSottile/mkcert/

```bash
root@mk:~# wget -q https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64

root@mk:~# mv mkcert-v1.4.3-linux-amd64 mkcert

root@mk:~# chmod +x mkcert

root@mk:~# mv mkcert /usr/local/bin/

root@mk:~# mkcert -h
```

## Create self-signed certificates

```bash
root@mk:~# cd /etc/mysql
root@mk:/etc/mysql# mkdir -vp ssl
root@mk:/etc/mysql# cd ssl

root@mk:/etc/mysql/ssl# mkcert -install
Created a new local CA 💥
The local CA is now installed in the system trust store! ⚡️

root@mk:/etc/mysql/ssl# cp "$(mkcert -CAROOT)/rootCA.pem" rootCA.pem

root@mk:/etc/mysql/ssl# mkcert -key-file mariadb-server.key -cert-file mariadb-server.crt 202.182.110.84

# convert to rsa type
root@mk:/etc/mysql/ssl# openssl rsa -in mariadb-server.key -out mariadb-server.key

root@mk:/etc/mysql/ssl# mkcert --client -key-file mariadb-client.key -cert-file mariadb-client.crt 202.182.110.84

# convert to rsa type
root@mk:/etc/mysql/ssl# openssl rsa -in mariadb-client.key -out mariadb-client.key

root@mk:/etc/mysql/ssl# ls
mariadb-client.crt  mariadb-client.key  mariadb-server.crt  mariadb-server.key  rootCA.pem

root@mk:/etc/mysql/ssl# openssl verify -CAfile rootCA.pem mariadb-server.crt mariadb-client.crt

root@mk:/etc/mysql/ssl# openssl x509 -in mariadb-server.crt -text -noout

```

## MariaDB SSL Setup

```bash
root@mk:~# mysql -u root -p
MariaDB [(none)]> show variables like '%ssl';
+---------------+----------+
| Variable_name | Value    |
+---------------+----------+
| have_openssl  | YES      |
| have_ssl      | DISABLED |
+---------------+----------+

root@mk:~# chown -Rv mysql:root /etc/mysql/ssl/

root@mk:~# vim /etc/mysql/mariadb.cnf
[mysqld]
ssl-ca=/etc/mysql/ssl/rootCA.pem
ssl-cert=/etc/mysql/ssl/mariadb-server.crt
ssl-key=/etc/mysql/ssl/mariadb-server.key
tls_version = TLSv1.2,TLSv1.3
bind-address = *

root@mk:~# systemctl restart mariadb

# Check for error, if any

root@mk:~# grep ssl /var/log/syslog
root@mk:~# grep ssl /var/log/syslog | grep key
root@mk:~# grep mysqld /var/log/syslog | grep -i ssl


root@mk:~# vim /etc/mysql/my.cnf
[client]
port            = 3306
socket          = /var/run/mysqld/mysqld.sock
ssl-ca=/etc/mysql/ssl/rootCA.pem
ssl-cert=/etc/mysql/ssl/mariadb-client.crt
ssl-key=/etc/mysql/ssl/mariadb-client.key

root@mk:~# mysql -u root -p
MariaDB [(none)]>  SHOW VARIABLES LIKE '%ssl%';
+---------------------+-----------------------------------+
| Variable_name       | Value                             |
+---------------------+-----------------------------------+
| have_openssl        | YES                               |
| have_ssl            | YES                               |
-----------------------------------------------------------

MariaDB [(none)]> status
--------------
mysql  Ver 15.1 Distrib 10.4.18-MariaDB, for debian-linux-gnu (x86_64) using readline 5.2

Connection id:		36
Current database:
Current user:		root@localhost
SSL:			Cipher in use is TLS_AES_256_GCM_SHA384 // SSL connection

```

## Mariadb Client Connection

```bash
root@mk:~# mysql -u root -p

CREATE DATABASE foo;
CREATE USER 'user5'@202.182.110.84 IDENTIFIED BY 'pass';
GRANT ALL PRIVILEGES ON foo.* TO 'user5'@202.182.110.84 IDENTIFIED BY 'pass' REQUIRE SSL;
FLUSH PRIVILEGES;

root@mk:~#  mysql -u user5 -p -h 202.182.110.84 //error
root@mk:~#  mysql -u user5 -h 202.182.110.84 -p --ssl-key=/etc/mysql/ssl/mariadb-client.key --ssl-cert=/etc/mysql/ssl/mariadb-client.crt --ssl-ca=/etc/mysql/ssl/rootCA.pem
```

## Python Client Connection

```bash
root@mk:~# apt-get install libmysqlclient-dev
root@mk:~# apt-get install gcc
root@mk:~# pip3 install mysqlclient
root@mk:~# python3 index.py
```

## Nodejs Client Connection

```bash
root@mk:~# curl https://get.volta.sh | bash
root@mk:~# exec -l $SHELL
root@mk:~# volta install node

root@mk:~# mkdir js
root@mk:~# cd js
root@mk:~# npm init -y
root@mk:~# npm install -S mariadb
root@mk:~# node index.js
```
