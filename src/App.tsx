import * as React from "react";
import { Understated } from "./understated";

interface AppState {
    caps: boolean;
    name: string;
    count: number;
    items: string[];
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
            count: 0,
            items: []
        }}
    >
        {({ setters, state: { name, count, caps, items } }) => {
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
                    <div>
                        {items.map((item, i) => <div key={i}>{item}</div>)}
                        <button onClick={setters.push("items", name)}>
                            Push
                        </button>
                        <button onClick={setters.pop("items")}>Pop</button>
                        <button onClick={setters.unshift("items", name)}>
                            Shift
                        </button>
                        <button onClick={setters.shift("items")}>
                            Unshift
                        </button>
                    </div>
                </>
            );
        }}
    </Understate>
);
