import {SqliteMessageTypeEnum} from "./enums/sqlite-message-type.enum";
import {CreateDatabaseMessage} from "./messages/create-database.message";
import {SqliteMessageInterface} from "./interfaces/sqlite-message.interface";
import {CreateDatabaseResultMessage} from "./messages/create-database-result.message";
import {Database, default as sqlite3InitModule} from "@sqlite.org/sqlite-wasm";
import {ExecuteSqlMessage} from "./messages/execute-sql.message";
import {ExecuteSqlResultMessage} from "./messages/execute-sql-result.message";
import {SqliteClientTypeEnum} from "./enums/sqlite-client-type.enum";
import {OpfsWorkerSqliteOptionsInterface} from "./interfaces/opfs-worker-sqlite-options.interface";
import {MemoryWorkerSqliteOptionsInterface} from "./interfaces/memory-worker-sqlite-options.interface";
import {OpfsSahWorkerSqliteOptionsInterface} from "./interfaces/opfs-sah-worker-sqlite-options.interface";

const log = (...args) => console.log(...args);

class SqliteClientWorker {
    protected db: Database;

    constructor() {
    }

    public async onMessageReceivedFromMainThread(messageEvent: MessageEvent) {
        const sqliteMessage = messageEvent.data as SqliteMessageInterface;

        switch (sqliteMessage.type) {
            case SqliteMessageTypeEnum.CreateDatabase:
                await this.createDatabase(sqliteMessage as CreateDatabaseMessage);
                break;
            case SqliteMessageTypeEnum.ExecuteSql:
                this.executeSql(sqliteMessage as ExecuteSqlMessage);
                break;
        }
    }

    public postBackMessageToMainThread(message: any) {
        self.postMessage(message);
    }

    private async createDatabase(createDatabaseMessage: CreateDatabaseMessage) {
        const uniqueId = createDatabaseMessage.uniqueId;
        const errorHandler = (error) => {
            console.error(error);
            this.postBackMessageToMainThread(new CreateDatabaseResultMessage(uniqueId, error));
            return;
        }

        try {
            const sqlite3 = await sqlite3InitModule({
                print: log,
                printErr: errorHandler,
            });

            switch (createDatabaseMessage.options.type) {
                case SqliteClientTypeEnum.MemoryMainThread:
                    this.postBackMessageToMainThread(new CreateDatabaseResultMessage(createDatabaseMessage.uniqueId, new Error(`The Sqlite-Client-Worker does not support the [${SqliteClientTypeEnum.MemoryMainThread}] types. This type can be used directly in the main thread.`)));
                    break;
                case SqliteClientTypeEnum.MemoryWorker:

                    try {
                        const options = createDatabaseMessage.options as MemoryWorkerSqliteOptionsInterface;

                        this.db = new sqlite3.oo1.DB(options.filename, options.flags);
                        this.postBackMessageToMainThread(new CreateDatabaseResultMessage(uniqueId));

                    } catch (err) {
                        errorHandler(err);
                    }
                    break;
                case SqliteClientTypeEnum.OpfsWorker:
                    try {
                        const options = createDatabaseMessage.options as OpfsWorkerSqliteOptionsInterface;

                        this.db = new sqlite3.oo1.OpfsDb(options.filename, options.flags);
                        this.postBackMessageToMainThread(new CreateDatabaseResultMessage(uniqueId));

                    } catch (err) {
                        errorHandler(err);
                    }
                    break;
                case SqliteClientTypeEnum.OpfsSahWorker:
                    try {
                        const options = createDatabaseMessage.options as OpfsSahWorkerSqliteOptionsInterface;

                        const poolUtil = await sqlite3.installOpfsSAHPoolVfs({
                            name: createDatabaseMessage.options.name,
                            directory: createDatabaseMessage.options.directory,
                            clearOnInit: createDatabaseMessage.options.clearOnInit,
                        });
                        this.db = new poolUtil.OpfsSAHPoolDb(createDatabaseMessage.options.filename);

                        this.postBackMessageToMainThread(new CreateDatabaseResultMessage(uniqueId));

                    } catch (err) {
                        errorHandler(err);
                    }
                    break;
            }
        } catch (err) {
            errorHandler(err);
        }
    }

    private executeSql(executeSqlMessage: ExecuteSqlMessage) {
        if (!this.db) {
            this.postBackMessageToMainThread(new ExecuteSqlResultMessage(executeSqlMessage.uniqueId, [], new Error("The database has not been created yet. Send a CreateDatabaseMessage first.")));
            return;
        }

        try {
            const result = this.db.exec({
                sql: executeSqlMessage.sqlStatement,
                bind: executeSqlMessage.bindingParameters,
                returnValue: executeSqlMessage.returnValue as any, // todo: investigate why Typescript expect that this be set to 'saveSql'.
                rowMode: executeSqlMessage.rowMode,

            });
            this.postBackMessageToMainThread(new ExecuteSqlResultMessage(executeSqlMessage.uniqueId, result as any)); // todo: investigate why Typescript thinks it's going to be the wrong type.
        } catch (e) {
            this.postBackMessageToMainThread(new ExecuteSqlResultMessage(executeSqlMessage.uniqueId, [], e));
        }
    }
}

// Instantiate the worker here.
const sqliteClientWorker = new SqliteClientWorker();

self.onmessage = async (messageEvent: MessageEvent) => {
    await sqliteClientWorker.onMessageReceivedFromMainThread(messageEvent);
}