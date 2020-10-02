declare module 'oset' {

    export class OMap<T> {
        constructor();

        clear(): any;

        del(e: string): any;

        difference(t: any): any;

        each(e: any, t: any, ...args: any[]): any;

        find(e: any, t: any, ...args: any[]): any;

        get(e: string): T;

        has(e: string): boolean;

        intersection(t: any): any;

        keys(): string[];

        merge(e: any): any;

        set(e: string, t: T, n: boolean): OMap<T>;

        size(): number;

        sort(e: any): any;

        union(t: any): any;

        values(): T[];

    }

    export class OSet {
        constructor();

        add(e: any, t: any): any;

        clear(): any;

        del(e: any): any;

        difference(t: any): any;

        each(e: any, t: any, ...args: any[]): any;

        find(e: any, t: any, ...args: any[]): any;

        has(e: any): any;

        intersection(t: any): any;

        merge(e: any): any;

        size(): any;

        sort(e: any): any;

        union(t: any): any;

        values(): any;

    }
}