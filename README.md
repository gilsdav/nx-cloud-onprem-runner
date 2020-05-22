# OnPrem NX Cloud

Decentralized NX cache.

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/nx-logo.png" width="450"></p>

🔎 **Nx is a set of Extensible Dev Tools for Monorepos.**

## How to use

### Start Server

* Image name: `gilsdav/nx-cloud-onprem`.
* Container port: `3333`
* Cache directory: `/nx-cache`

```sh
docker run -d -p 8080:3333 -v my-cache-directory:/nx-cache gilsdav/nx-cloud-onprem
```

### Configure NX runner

Install `@gilsdav/nx-cloud-onprem-runner` into your NX project.

```sh
npm install --save-dev @gilsdav/nx-cloud-onprem-runner
```

Change the `tasksRunnerOptions` section into `nx.json` by:

```json
"tasksRunnerOptions": {
  "default": {
    "runner": "@gilsdav/nx-cloud-onprem-runner",
    "options": {
      "cacheableOperations": ["build", "lint", "test", "e2e"],
      "bucket": {
        "url": "http://localhost:8080/api"
      }
    }
  }
},
```

If you deployed this into a server, change `http://localhost:8080` by your own server address.

## From source code

### Start Server

1. Clone this git repository
2. Install deps with the command `npm install`
3. Start server with the command `npm start`

### Configure NX runner

To use remote build you need to use an other runner than the default one.

Change the `tasksRunnerOptions` section into `nx.json` by:

```json
"tasksRunnerOptions": {
  "default": {
    "runner": "./extension",
    "options": {
      "cacheableOperations": ["build", "lint", "test", "e2e"],
      "bucket": {
        "url": "http://localhost:3333/api"
      }
    }
  }
},
```

If you deployed this into a server, change `http://localhost:3333` by your own server address.

## Test remote cache

1. Build the application: `npm run nx -- build todos`
2. Go to `node_modules/.cache` folder and delete `nx`
3. Run again the build command: `npm run nx -- build todos`
4. You got message that inform you the build comes form cache
