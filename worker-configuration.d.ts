declare module '*.html' {
  const content: string;
  export default content;
}

// Type definitions for Cloudflare Workers
declare global {
    interface D1Database {
        prepare(query: string): D1PreparedStatement;
        dump(): Promise<ArrayBuffer>;
        batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
        exec(query: string): Promise<D1ExecResult>;
    }

    interface D1PreparedStatement {
        bind(...values: any[]): D1PreparedStatement;
        first<T = unknown>(colName?: string): Promise<T | null>;
        run(): Promise<D1Result>;
        all<T = unknown>(): Promise<D1Result<T>>;
        raw<T = unknown>(): Promise<T[]>;
    }

    interface D1Result<T = unknown> {
        results?: T[];
        success: boolean;
        error?: string;
        meta: {
            duration: number;
            size_after: number;
            rows_read: number;
            rows_written: number;
        };
    }

    interface D1ExecResult {
        count: number;
        duration: number;
    }

    interface R2Bucket {
        head(key: string): Promise<R2Object | null>;
        get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
        put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions): Promise<R2Object>;
        delete(keys: string | string[]): Promise<void>;
        list(options?: R2ListOptions): Promise<R2Objects>;
    }

    interface R2Object {
        key: string;
        version: string;
        size: number;
        etag: string;
        httpEtag: string;
        uploaded: Date;
        httpMetadata?: R2HTTPMetadata;
        customMetadata?: Record<string, string>;
    }

    interface R2ObjectBody extends R2Object {
        body: ReadableStream;
        bodyUsed: boolean;
        arrayBuffer(): Promise<ArrayBuffer>;
        text(): Promise<string>;
        json<T>(): Promise<T>;
        blob(): Promise<Blob>;
    }

    interface R2GetOptions {
        onlyIf?: R2Conditional;
        range?: R2Range;
    }

    interface R2PutOptions {
        onlyIf?: R2Conditional;
        httpMetadata?: R2HTTPMetadata;
        customMetadata?: Record<string, string>;
        md5?: ArrayBuffer | string;
        sha1?: ArrayBuffer | string;
        sha256?: ArrayBuffer | string;
        sha384?: ArrayBuffer | string;
        sha512?: ArrayBuffer | string;
    }

    interface R2ListOptions {
        limit?: number;
        prefix?: string;
        cursor?: string;
        delimiter?: string;
        startAfter?: string;
        include?: ('httpMetadata' | 'customMetadata')[];
    }

    interface R2Objects {
        objects: R2Object[];
        truncated: boolean;
        cursor?: string;
        delimitedPrefixes: string[];
    }

    interface R2HTTPMetadata {
        contentType?: string;
        contentLanguage?: string;
        contentDisposition?: string;
        contentEncoding?: string;
        cacheControl?: string;
        cacheExpiry?: Date;
    }

    interface R2Conditional {
        etagMatches?: string;
        etagDoesNotMatch?: string;
        uploadedBefore?: Date;
        uploadedAfter?: Date;
    }

    interface R2Range {
        offset?: number;
        length?: number;
        suffix?: number;
    }

    // Web Crypto API (available in Cloudflare Workers)
    const crypto: Crypto;
    
    interface Crypto {
        subtle: SubtleCrypto;
        getRandomValues<T extends ArrayBufferView>(array: T): T;
    }

    interface SubtleCrypto {
        digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer>;
    }

    // Text encoding (available in Cloudflare Workers)
    class TextEncoder {
        encode(input?: string): Uint8Array;
    }

    // File API (available in Cloudflare Workers)
    class File extends Blob {
        readonly lastModified: number;
        readonly name: string;
        readonly webkitRelativePath: string;
    }

    // Headers API (available in Cloudflare Workers)
    class Headers {
        constructor(init?: HeadersInit);
        append(name: string, value: string): void;
        delete(name: string): void;
        get(name: string): string | null;
        has(name: string): boolean;
        set(name: string, value: string): void;
        forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void;
    }

    type HeadersInit = Headers | Record<string, string> | [string, string][];

    // Response API (available in Cloudflare Workers)
    class Response {
        constructor(body?: BodyInit | null, init?: ResponseInit);
        readonly body: ReadableStream<Uint8Array> | null;
        readonly bodyUsed: boolean;
        readonly headers: Headers;
        readonly ok: boolean;
        readonly redirected: boolean;
        readonly status: number;
        readonly statusText: string;
        readonly type: ResponseType;
        readonly url: string;
        clone(): Response;
        arrayBuffer(): Promise<ArrayBuffer>;
        blob(): Promise<Blob>;
        formData(): Promise<FormData>;
        json(): Promise<any>;
        text(): Promise<string>;
        static error(): Response;
        static redirect(url: string, status?: number): Response;
    }

    type BodyInit = Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array> | string;
    type ResponseType = "basic" | "cors" | "error" | "opaque" | "opaqueredirect";

    interface ResponseInit {
        status?: number;
        statusText?: string;
        headers?: HeadersInit;
    }

    // Console API (available in Cloudflare Workers)
    interface Console {
        log(...data: any[]): void;
        error(...data: any[]): void;
        warn(...data: any[]): void;
        info(...data: any[]): void;
        debug(...data: any[]): void;
    }

    const console: Console;
}
