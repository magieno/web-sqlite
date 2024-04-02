import {SqliteClientOptions} from "./types/sqlite-client.options";
import {SqliteAdapterInterface} from "./interfaces/sqlite-adapter.interface";
import {SqliteClientTypeEnum} from "./enums/sqlite-client-type.enum";
import {InMainThreadSqliteAdapter} from "./adapters/in-main-thread.sqlite-adapter";
import {ReturnValueEnum} from "./enums/return-value.enum";
import {RowModeEnum} from "./enums/row-mode.enum";
import {InWorkerSqliteAdapter} from "./adapters/in-worker.sqlite-adapter";

export * from "./adapters/adapters";
export * from "./enums/enums";
export * from "./interfaces/interfaces";
export * from "./messages/messages";
export * from "./proxies/proxies";
export * from "./types/types";

export class SqliteClient {
    public readonly adapter: SqliteAdapterInterface;

    constructor(private readonly options: SqliteClientOptions) {
        switch (this.options.type) {
            case SqliteClientTypeEnum.MemoryMainThread:
                this.adapter = new InMainThreadSqliteAdapter(this.options);
                break;
            case SqliteClientTypeEnum.MemoryWorker:
            case SqliteClientTypeEnum.OpfsWorker:
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

        const response = this.adapter.executeSql(sqlStatement, bindParameters, returnValue, rowMode);

    }
}
