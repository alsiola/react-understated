import * as React from "react";
import { Understated } from "./understated";

interface RenderPropsState {
    caps: boolean;
    name: string;
    count: number;
}

interface RenderPropsSetters {
    square: (a: number) => number;
}

const Understate = Understated.create<RenderPropsState, RenderPropsSetters>();

const pow = (p: number) => (a: number) => Math.pow(a, p);

export const RenderProps: React.SFC<{}> = () => (
    <Understate
        setters={{ square: pow(2) }}
        initialState={{
            name: "Alex",
            count: 0,
            caps: false
        }}
    >
        {({ setters, state: { name, count, caps } }) => {
            return (
                <>
                    <div>
                        Name: {caps ? name.toUpperCase() : name}
                        <br />
                        <input
                            type="text"
                            onChange={setters.fromEvent("name")}
                            value={name}
                        />
                        <button onClick={setters.toggle("caps")}>Caps</button>
                    </div>
                    <div>
                        Count: {count}
                        <br />
                        <button onClick={setters.increment("count")}>Up</button>
                        <button onClick={setters.decrement("count")}>
                            Down
                        </button>
                        <button onClick={setters.square("count")}>
                            Square
                        </button>
                    </div>
                </>
            );
        }}
    </Understate>
);
