import { ProgramOptions } from "./types";
export declare const getCertPublisher: (cert: string, cert_pass: string) => Promise<string>;
export declare const priConfig: (program: ProgramOptions) => Promise<void>;
export declare const pri: (program: ProgramOptions) => Promise<void>;
export declare const make: (program: ProgramOptions) => Promise<void>;
export declare const sign: (program: ProgramOptions) => Promise<void>;
