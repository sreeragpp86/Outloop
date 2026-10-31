declare module "bun:sqlite" {
  export class Database {
    constructor(filename?: string, options?: { readonly?: boolean; create?: boolean; readwrite?: boolean });
    run(sql: string, ...params: any[]): any;
    exec(sql: string): void;
    query(sql: string): {
      all(...params: any[]): any[];
      get(...params: any[]): any;
      run(...params: any[]): any;
      values(...params: any[]): any[];
    };
    prepare(sql: string): {
      run(...params: any[]): any;
      all(...params: any[]): any[];
      get(...params: any[]): any;
    };
    transaction<T extends (...args: any[]) => any>(fn: T): T;
    close(): void;
  }
}

declare module "@supabase/supabase-js" {
  export function createClient(supabaseUrl: string, supabaseKey: string, options?: any): any;
}

interface ImportMeta {
  main?: boolean;
}

