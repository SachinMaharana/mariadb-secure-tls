#!/usr/bin/python
import MySQLdb
ssl = {'cert': '/etc/mysql/ssl/mariadb-client.crt',
       'key': '/etc/mysql/ssl/mariadb-client.key'}
conn = MySQLdb.connect(host='202.182.110.84',
                       user='user5', passwd='pass', ssl=ssl)
cursor = conn.cursor()
cursor.execute("SHOW STATUS LIKE 'Ssl_cipher'")
print(cursor.fetchone())
