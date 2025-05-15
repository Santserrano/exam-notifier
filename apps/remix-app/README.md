# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

This Remix app lives inside a Monorepo powered by turborepo, the scripts should be launched
from the root of your Monorepo.

## Development

> **Warning**
> All the following commands should be launched from the **monorepo root directory**

Start the Remix development asset server and the Express server by running:

```sh
pnpm run dev --filter=@exam-notifier/remix-app...
```

This starts your app in development mode, which will purge the server require cache when Remix rebuilds assets so you don't need a process manager restarting the express server.

## Deployment

> **Warning**
> All the following commands should be launched from the **monorepo root directory**

Build App for production:

```sh
pnpm run build --filter=@exam-notifier/remix-app...
```

Then run the app in production mode:

```sh
pnpm run start --filter=@exam-notifier/remix-app
```

Now you'll need to pick a host to deploy it to.
