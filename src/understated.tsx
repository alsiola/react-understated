import * as React from "react";
import { Component } from "react";

export type SetArgs<T, U extends keyof T> = Pick<T, U> | ((a: T) => Pick<T, U>);

type HelpersWithNevers<TProps, TSetters> = {
    [PropKey in keyof TProps]: {
        [SetterKey in keyof TSetters]: {
            [prop in PropKey]: TSetters[SetterKey] extends (
                a: TProps[PropKey]
            ) => TProps[PropKey]
                ? (prop: PropKey) => () => Promise<void>
                : never
        }[PropKey]
    }
};

type Helpers<
    TProps,
    TSetters,
    RawHelpers = HelpersWithNevers<TProps, TSetters>
> = {
    [RawHelperKey in keyof RawHelpers]: RawHelpers[RawHelperKey] extends (
        a: RawHelpers[RawHelperKey]
    ) => never
        ? never
        : RawHelpers[RawHelperKey]
}[keyof RawHelpers];

export type TypedSetter<T, V> = <U extends keyof PropsOfType<T, V>>(
    a: U
) => () => Promise<void>;

export interface NativeSetters<T> {
    set: <U extends keyof T>(a: SetArgs<T, U>) => Promise<void>;
    fromEvent: <U extends keyof T>(
        a: U
    ) => (e: React.ChangeEvent<any>) => Promise<void>;
    curry: <U extends keyof T>(a: SetArgs<T, U>) => () => Promise<void>;
    increment: TypedSetter<T, number>;
    decrement: TypedSetter<T, number>;
    toggle: TypedSetter<T, boolean>;
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
> extends Component<UnderstatedProps<T, V>, T> {
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
            toggle: this.toggle
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
