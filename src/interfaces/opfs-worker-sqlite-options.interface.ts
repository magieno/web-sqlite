import {SqliteClientTypeEnum} from "../enums/sqlite-client-type.enum";

export interface OpfsWorkerSqliteOptionsInterface {
    type: SqliteClientTypeEnum.OpfsWorker;

    filename: string;

    flags: string;

    sqliteWorkerPath: string;

    // Default: false;
    emitEventsToMagienoSqliteChromeExtension?: boolean;
}