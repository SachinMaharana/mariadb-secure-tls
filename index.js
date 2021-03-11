const fs = require("fs");
const mariadb = require("mariadb");

//reading certificates from file
const serverCert = [fs.readFileSync("/etc/mysql/ssl/rootCA.pem", "utf8")];
const clientKey = [
  fs.readFileSync("/etc/mysql/ssl/mariadb-client.key", "utf8"),
];
const clientCert = [
  fs.readFileSync("/etc/mysql/ssl/mariadb-client.crt", "utf8"),
];

//connecting
mariadb
  .createConnection({
    user: "user5",
    host: "202.182.110.84",
    database: "foo",
    password: "pass",
    ssl: {
      ca: serverCert,
      cert: clientCert,
      key: clientKey,
    },
  })
  .then((conn) => {
    console.log("connected");
    conn.end();
  })
  .catch((err) => console.log(err));
