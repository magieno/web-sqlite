# SQLite Client

SQLite Client is a wrapper for [SQLite](https://github.com/sqlite/sqlite-wasm) that uses the Origin Private File System (OPFS) to persist the SQLite database file.

This library supports the following backing mechanism:
* In Memory (Main Thread)
* In Memory (Worker)
* OPFS (Worker)
* OPFS SyncAccessHandles (Worker)

## Installation using NPM

This library has two important files: `sqlite-client.js` and `sqlite-client-worker.js`. 
Behind the scenes, the SqliteClient communicates with a worker (if needed) to run the SQL statements and return you the results
on the main thread. It also supports the Memory Main Thread mode.

1- Install the NPM package

```
npm install @magieno/sqlite-client
```

1- Import the `sqlite-client` library in your code and use it as such:

**Memory Main Thread**
```
import {SqliteClient} from "@magieno/sqlite-client";

const filename = "/test.sqlite3"; // This is the name of your database. It corresponds to the path in the OPFS.

const sqliteClient = new SqliteClient({
    type: SqliteClientTypeEnum.MemoryMainThread,
    filename,
    flags: "c", // See sqlite documentation for which flags to use    
})
```

**Memory Worker**
```
import {SqliteClient} from "@magieno/sqlite-client";

const sqliteWorkerPath = "assets/js/sqlite-client-worker.js"; // Must correspond to the path in your final deployed build.
const filename = "/test.sqlite3"; // This is the name of your database. It corresponds to the path in the OPFS.

const sqliteClient = new SqliteClient({
    type: SqliteClientTypeEnum.MemoryWorker,
    filename,
    sqliteWorkerPath,
    flags: "c", // See sqlite documentation for which flags to use
})
```

**OPFS Worker**
```
import {SqliteClient} from "@magieno/sqlite-client";

const sqliteWorkerPath = "assets/js/sqlite-client-worker.js"; // Must correspond to the path in your final deployed build.
const filename = "/test.sqlite3"; // This is the name of your database. It corresponds to the path in the OPFS.

const sqliteClient = new SqliteClient({
    type: SqliteClientTypeEnum.OpfsWorker,
    filename,
    sqliteWorkerPath,
    flags: "c", // See sqlite documentation for which flags to use
})
```

**OPFS Sync Access Handle Worker**
```
import {SqliteClient} from "@magieno/sqlite-client";

const sqliteWorkerPath = "assets/js/sqlite-client-worker.js"; // Must correspond to the path in your final deployed build.
const filename = "/test.sqlite3"; // This is the name of your database. It corresponds to the path in the OPFS.

const sqliteClient = new SqliteClient({
    type: SqliteClientTypeEnum.OpfsSahWorker,
    filename,
    sqliteWorkerPath,
})
```

1- With the client instantiated, you need to initiate it and then you can execute SQL Queries

```
await sqliteClient.init();

await sqliteClient.executeSql("CREATE TABLE IF NOT EXISTS test(a,b)");
await sqliteClient.executeSql("INSERT INTO test VALUES(?, ?)", [6,7]);
const results = await sqliteClient.executeSql("SELECT * FROM test");
```

1- Copy the `node_modules/@magieno/sqlite-client/dist/bundle/sqlite-client-worker.js` to your final bundle
This is dependent on the framework you are using but the idea is that this .js file should be copied and available in your build.

1- Copy the files `node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/*` file to your final bundle next to `sqlite-client-worker.js`.

1- **Warning** Your server must set the following Http headers when serving your files

`Cross-Origin-Opener-Policy: same-origin`

`Cross-Origin-Embedder-Policy: require-corp`

### Demos
We have created a repository that contains demos that you can look at: 

https://github.com/magieno/sqlite-client-demo
