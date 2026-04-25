export declare class log {
    private static log;
    static info: (message: string, object?: any) => void;
    static warn: (message: string, object?: any) => void;
    static error: (message: string, throwError?: boolean, object?: any) => void;
    static debug: (message: string, object?: any) => void;
}
