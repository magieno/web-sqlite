import {SqliteClientOptions} from "./types/sqlite-client.options";
import {SqliteAdapterInterface} from "./interfaces/sqlite-adapter.interface";
import {SqliteClientTypeEnum} from "./enums/sqlite-client-type.enum";
import {InMainThreadSqliteAdapter} from "./adapters/in-main-thread.sqlite-adapter";
import {ReturnValueEnum} from "./enums/return-value.enum";
import {RowModeEnum} from "./enums/row-mode.enum";
import {InWorkerSqliteAdapter} from "./adapters/in-worker.sqlite-adapter";
import {SqliteClientExtension} from "./sqlite-client-extension";

export * from "./adapters/adapters";
export * from "./enums/enums";
export * from "./interfaces/interfaces";
export * from "./messages/messages";
export * from "./proxies/proxies";
export * from "./types/types";
export * from "./sqlite-client-extension";

export class SqliteClient {
    public readonly adapter: SqliteAdapterInterface;

    constructor(private readonly options: SqliteClientOptions) {
        switch (this.options.type) {
            case SqliteClientTypeEnum.MemoryMainThread:
                this.adapter = new InMainThreadSqliteAdapter(this.options);
                break;
            case SqliteClientTypeEnum.OpfsWorker:
                if(this.options.emitEventsToMagienoSqliteChromeExtension === true) { // Only available to OpfsWorker for now.
                    // Register the worker path so the extension can use it to interact with your SQLite databases.
                    SqliteClientExtension.register(this.options.sqliteWorkerPath);
                }
            case SqliteClientTypeEnum.MemoryWorker:
            case SqliteClientTypeEnum.OpfsSahWorker:
                this.adapter = new InWorkerSqliteAdapter(this.options);

                break;
            default:
                throw new Error(`Unknown sqlite client type for options: '${this.options}.`);
        }
    }

    public async init() {
        return this.adapter.init();
    }

    public async executeSql(sqlStatement: string, bindParameters: (string | number)[] = [], returnValue: ReturnValueEnum = ReturnValueEnum.ResultRows, rowMode: RowModeEnum | number = RowModeEnum.Array): Promise<any> {
        if(this.adapter === undefined) {
            throw new Error("You need to call `init` before calling `executeSql`.");
        }

        return this.adapter.executeSql(sqlStatement, bindParameters, returnValue, rowMode);
    }
}