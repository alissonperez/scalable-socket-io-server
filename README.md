POC - Scalable Socket IO implementation with Redis
---------------------------------

We'll start two servers to be our socket.io servers and http servers (for HTTP clients). You'll need to have a redis running locally in default ports.

```
$ node server.js 1340 1330
```

In other terminal window:

```
$ node server.js 1341 1331
```

Now, you can star our two clients (each one pointing to a server):

```
$ node client.js 1330
```

In other terminal window:

```
$ node client.js 1331
```

Now, in our servers you'll see our client Ids, like this:

```
a user connected: JAD3edPzM2tWrsoJAAAA
```

With this code, you can make a request to any running server and your request will be delivered to correct socket io client and answered back. \o/\o/\o/\o/

First HTTP server:
```
curl -v localhost:1340/JAD3edPzM2tWrsoJAAAA
```

Second HTTP server:
```
curl -v localhost:1341/JAD3edPzM2tWrsoJAAAA
```
