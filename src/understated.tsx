import * as React from "react";

export type SetArgs<T, U extends keyof T> = Pick<T, U> | ((a: T) => Pick<T, U>);

type HelpersWithNevers<T, U> = {
    [KT in keyof T]: {
        [K in keyof U]: {
            [prop in KT]: U[K] extends (a: T[KT]) => T[KT]
                ? (prop: KT) => () => Promise<T[KT]>
                : never
        }[KT]
    }
};

type Helpers<T, U, V = HelpersWithNevers<T, U>> = {
    [K in keyof V]: V[K] extends (a: V[K]) => never ? never : V[K]
}[keyof V];

export type TypedSetter<T, V, R = void> = <U extends keyof PropsOfType<T, V>>(
    a: U
) => () => Promise<R>;

export interface NativeSetters<T> {
    set: <U extends keyof T>(a: SetArgs<T, U>) => Promise<void>;
    fromEvent: <U extends keyof T>(
        a: U
    ) => (e: React.ChangeEvent<any>) => Promise<void>;
    curry: <U extends keyof T>(a: SetArgs<T, U>) => () => Promise<void>;
    increment: TypedSetter<T, number>;
    decrement: TypedSetter<T, number>;
    toggle: TypedSetter<T, boolean>;
    push: <U, V extends keyof PropsOfType<T, U[]>>(
        prop: V,
        item: U
    ) => () => Promise<void>;
    unshift: <U, V extends keyof PropsOfType<T, U[]>>(
        prop: V,
        item: U
    ) => () => Promise<void>;
    pop: <U, V extends keyof PropsOfType<T, U[]>>(
        prop: V,
        cb?: (a: U | undefined) => void
    ) => () => Promise<V>;
    shift: <U, V extends keyof PropsOfType<T, U[]>>(
        prop: V,
        cb?: (a: U | undefined) => void
    ) => () => Promise<V>;
}

export interface UnderstatedProvides<T, V> {
    state: T;
    setters: NativeSetters<T> & Helpers<T, V>;
}

export interface UnderstatedProps<T, V> {
    initialState?: Partial<T>;
    setters?: V;
    onChange?: (s: T) => void | Promise<void>;
    children: (a: UnderstatedProvides<T, V>) => React.ReactNode;
}

type UPropertyNames<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never
}[keyof T];
type PropsOfType<T, U> = Pick<T, UPropertyNames<T, U>>;

export class Understated<
    T,
    V extends Record<string, (a: any) => any>
> extends React.Component<UnderstatedProps<T, V>, T> {
    public static create<U, W>() {
        return (Understated as any) as new () => React.Component<
            UnderstatedProps<U, W>,
            U
        >;
    }

    constructor(props: UnderstatedProps<T, V>) {
        super(props);
        this.state = (props.initialState || {}) as T;
    }

    private set = <U extends keyof T>(
        setArgs: SetArgs<T, U>
    ): Promise<void> => {
        return new Promise(resolve =>
            this.setState(setArgs, () => {
                Promise.resolve(
                    this.props.onChange && this.props.onChange(this.state)
                ).then(resolve);
            })
        );
    };

    private setFromInputEvent = <U extends keyof T>(key: U) => (
        e: React.ChangeEvent<any>
    ): Promise<void> => {
        return this.set({
            [key]: e.currentTarget.value as T[U]
        } as any);
    };

    private setC = <U extends keyof T>(a: SetArgs<T, U>) => (): Promise<void> =>
        this.set(a);

    private increment = (inc: number) => <
        U extends keyof PropsOfType<T, number>
    >(
        key: U
    ) => (): Promise<void> => {
        return this.set(
            s =>
                ({
                    [key]: ((s[key] as any) as number) + inc
                } as any)
        );
    };

    private toggle = <U extends keyof PropsOfType<T, boolean>>(
        key: U
    ) => (): Promise<void> => {
        return this.set(
            s =>
                ({
                    [key]: !s[key]
                } as any)
        );
    };

    private push = <U, K extends keyof PropsOfType<T, U[]>>(
        prop: K,
        item: U
    ) => () => {
        return this.set(
            s =>
                ({
                    [prop]: [...((s[prop] as any) as U[]), item]
                } as any)
        );
    };

    private pop = <U, K extends keyof PropsOfType<T, U[]>>(
        prop: K,
        cb?: (a: U | undefined) => void
    ) => () => {
        let popped: U | undefined;
        return this.set(s => {
            const current = ((s[prop] as any) as U[]).slice();
            popped = current.pop();

            return {
                [prop]: current
            } as any;
        }).then(() => cb && cb(popped));
    };

    private unshift = <U, K extends keyof PropsOfType<T, U[]>>(
        prop: K,
        item: U
    ) => () => {
        return this.set(
            s =>
                ({
                    [prop]: [item, ...((s[prop] as any) as U[])]
                } as any)
        );
    };

    private shift = <U, K extends keyof PropsOfType<T, U[]>>(
        prop: K,
        cb?: (a: U | undefined) => void
    ) => () => {
        let shifted: U | undefined;
        return this.set(s => {
            const current = ((s[prop] as any) as U[]).slice();
            shifted = current.shift();

            return {
                [prop]: current
            } as any;
        }).then(() => cb && cb(shifted));
    };

    private runSetter = <U extends {}>(f: (a: U) => U) => (
        a: keyof PropsOfType<T, U>
    ) => (): Promise<void> => {
        return this.set({
            [a]: f((this.state[a] as any) as U)
        } as any);
    };

    public render() {
        const nativeSetters: NativeSetters<T> = {
            set: this.set,
            increment: this.increment(1),
            decrement: this.increment(-1),
            fromEvent: this.setFromInputEvent,
            curry: this.setC,
            toggle: this.toggle,
            push: this.push as any,
            pop: this.pop as any,
            shift: this.shift as any,
            unshift: this.unshift as any
        };

        const helperSetters: Helpers<T, V> = Object.keys(
            this.props.setters || {}
        ).reduce(
            (out, setter) => ({
                ...out,
                [setter]: this.runSetter((this.props.setters || {})[setter])
            }),
            {}
        ) as Helpers<T, V>;

        return this.props.children({
            state: this.state,
            setters: Object.assign({}, nativeSetters, helperSetters)
        });
    }
}
