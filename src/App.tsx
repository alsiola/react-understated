import * as React from "react";
import { Understated } from "./understated";

interface AppState {
    caps: boolean;
    name: string;
    count: number;
}

interface AppSetters {
    square: (a: number) => number;
}

const Understate = Understated.create<AppState, AppSetters>();

const sq = (a: number) => a * a;

export const App: React.SFC<{}> = () => (
    <Understate
        setters={{ square: sq }}
        initialState={{
            name: "Alex",
            count: 0
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
