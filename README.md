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

```bash
wget -q https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64

mv mkcert-v1.4.3-linux-amd64 mkcert

chmod +x mkcert

mv mkcert /usr/local/bin/

mkcert -h
```

```bash
cd /etc/mysql
mkdir -vp ssl
cd ssl

mkcert -install

cp "$(mkcert -CAROOT)/rootCA.pem" rootCA.pem

mkcert -key-file mariadb-server.key -cert-file mariadb-server.crt 202.182.110.84

openssl rsa -in mariadb-server.key -out mariadb-server.key

mkcert --client -key-file mariadb-client.key -cert-file mariadb-client.crt 02.182.110.84

openssl rsa -in mariadb-client.key -out mariadb-client.key

root@mk:/etc/mysql/ssl# ls
mariadb-client.crt  mariadb-client.key  mariadb-server.crt  mariadb-server.key  rootCA.pem

openssl verify -CAfile rootCA.pem mariadb-server.crt mariadb-client.crt

openssl x509 -in mariadb-server.crt -text -noout



```

```
MariaDB [(none)]> show variables like '%ssl';
+---------------+----------+
| Variable_name | Value    |
+---------------+----------+
| have_openssl  | YES      |
| have_ssl      | DISABLED |
+---------------+----------+

chown -Rv mysql:root /etc/mysql/ssl/

vim /etc/mysql/mariadb.cnf
[mysqld]
ssl-ca=/etc/mysql/ssl/rootCA.pem
ssl-cert=/etc/mysql/ssl/mariadb-server.crt
ssl-key=/etc/mysql/ssl/mariadb-server.key
tls_version = TLSv1.2,TLSv1.3
bind-address = *

systemctl restart mariadb

grep ssl /var/log/syslog
grep ssl /var/log/syslog | grep key
grep mysqld /var/log/syslog | grep -i ssl


vim /etc/mysql/my.cnf
[client]
port            = 3306
socket          = /var/run/mysqld/mysqld.sock
ssl-ca=/etc/mysql/ssl/rootCA.pem
ssl-cert=/etc/mysql/ssl/mariadb-client.crt
ssl-key=/etc/mysql/ssl/mariadb-client.key

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
SSL:			Cipher in use is TLS_AES_256_GCM_SHA384

```

```bash
mysql -u root -p
CREATE DATABASE foo;
GRANT ALL ON foo.* TO bar@202.182.110.1 IDENTIFIED BY 'mypassword' REQUIRE SSL;
flush privileges;

mysql -u bar -p -h 202.182.110.1 foo

GRANT ALL PRIVILEGES ON foo.* TO 'user1'@'%' IDENTIFIED BY 'password1' REQUIRE SSL;
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'user1'@202.182.110.1;

mysql -u user4 -p -h 202.182.110.84

mysql -u user2 -h localhost -p --ssl-key=/etc/mysql/ssl/mariadb-client.key --ssl-cert=/etc/mysql/ssl/mariadb-client.crt --ssl-ca=/etc/mysql/ssl/rootCA.pem


CREATE USER 'user5'@202.182.110.84 IDENTIFIED BY 'pass';
GRANT ALL PRIVILEGES ON foo.* TO 'user5'@202.182.110.84 IDENTIFIED BY 'pass' REQUIRE SSL;
FLUSH PRIVILEGES;
mysql -u user5 -p -h 202.182.110.84 //error
mysql -u user5 -h 202.182.110.84 -p --ssl-key=/etc/mysql/ssl/mariadb-client.key --ssl-cert=/etc/mysql/ssl/mariadb-client.crt --ssl-ca=/etc/mysql/ssl/rootCA.pem
```

```bash
apt-get install libmysqlclient-dev
apt-get install gcc
pip3 install mysqlclient
```

```bash
curl https://get.volta.sh | bash
exec -l $SHELL
volta install node

mkdir js
cd js
npm init -y
npm install -S mariadb
node index.js
```
