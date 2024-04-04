import {SqliteClientTypeEnum} from "./enums/sqlite-client-type.enum";
import {ReturnValueEnum, RowModeEnum, SqliteClient} from "./sqlite-client";

export class SqliteClientExtension {
    public static workerPath: string;

    error: string;

    static dispatchEvent(event: {type: string, uniqueId: string, [x: string]: any}) {
        window.dispatchEvent(new CustomEvent("MAGIENO_SQLITE_CLIENT_TO_EXTENSION", {
            detail: event,
        }));
    }

    public static registerWorkerPath(sqliteWorkerPath) {
        SqliteClientExtension.workerPath = sqliteWorkerPath;

        // Cache the worker path in CacheStorage, so that the extension can use it when the app is in other pages.
        caches.open("magieno").then(cache => {
            cache.put("sqlite-worker", new Response(sqliteWorkerPath));
        });
    }

    /**
     * This method registers and enables event listeners that will be used by the Magieno SQLite Editor Chrome Extension.
     * @param workerPath
     */
    static register(workerPath: string) {
        SqliteClientExtension.registerWorkerPath(workerPath);

        // Setup the listeners
        window.addEventListener('MAGIENO_SQLITE_CLIENT_FROM_EXTENSION', async (event: CustomEvent) => {
            await SqliteClientExtension.receiveEvent(event);
        });
    }

    static async receiveEvent(event: CustomEvent) {
        const detail = event.detail;

        switch (detail.type) {
            case "INIT":
                if(SqliteClientExtension.workerPath === undefined) {
                    SqliteClientExtension.dispatchEvent({"type": "INIT_RESULT", "uniqueId": detail.uniqueId, "error": "Cannot find the SqliteWorkerPath. For security reasons, you must manually register it in your page: `SqliteClientExtension.registerWorkerPath('/path/to/sqlite-worker.mjs')`"});
                    return;
                }

                SqliteClientExtension.dispatchEvent({"type": "INIT_RESULT", "uniqueId": detail.uniqueId});
                return;
            case "EXECUTE_SQL_QUERY":
                const client = new SqliteClient({
                    type: SqliteClientTypeEnum.OpfsWorker,
                    filename: detail.filename,
                    flags: "c",
                    sqliteWorkerPath: SqliteClientExtension.workerPath,
                })

                await client.init();

                try {
                    const response = await client.executeSql(detail.query, [], ReturnValueEnum.ResultRows, RowModeEnum.Object);
                    SqliteClientExtension.dispatchEvent({"type": "EXECUTE_SQL_QUERY_RESULT", "uniqueId": detail.uniqueId, "filename": detail.filename, "response": response});
                    return;
                } catch (error) {
                    SqliteClientExtension.dispatchEvent({"type": "EXECUTE_SQL_QUERY_RESULT", "uniqueId": detail.uniqueId, "error": error.message});
                }
        }
    }
}