# vulcan-embedding

This repository illustrates how a webgme deployment can be configured w.r.t.

- Replacing default webgme database authorization with custom module
- Deploying webgme as a docker container see [Dockerfile](https://github.com/webgme/vulcan-embedding/blob/master/Dockerfile) and [config.docker.js](https://github.com/webgme/vulcan-embedding/blob/master/config/config.docker.js)
- Configuring the UI to fit as an embeded element

#### Running the embedded version
To start the three servers (webgme, the embedder and the reverse proxy) do:
```
npm run proxy
```

From a browser go to:
```
127.0.0.0:8080/embedder
```

This will identify you as the guest. To be authenticated as `root` or `dev` instead visit:
```
127.0.0.0:8080/embedder?token=<one of the generated tokens from console>
```
