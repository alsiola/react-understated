import * as React from "react";
import { SFC, ReactElement } from "react";
import { Understated, UnderstatedProvides } from "./understated";

export type USComponent<P, S, H = {}> = (
    props: P,
    state: UnderstatedProvides<S, H>
) => ReactElement<P>;

export const HOC = <P, S, H = {}>(
    component: USComponent<P, S, H>,
    opts: { initialState: Partial<S> }
): SFC<P> => props => {
    const Understate = Understated.create<S, H>();
    return (
        <Understate initialState={opts.initialState}>
            {understatedProps => component(props, understatedProps)}
        </Understate>
    );
};
