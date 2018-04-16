import * as React from "react";
import { HOC, USComponent } from "./hoc";

interface FullProps {
    firstName: string;
}

interface FullState {
    lastName: string;
}

const HOCProps: USComponent<FullProps, FullState> = (
    { firstName },
    { state: { lastName }, setters }
) => (
    <>
        Name: {firstName} {lastName}
        <br />
        <input value={lastName} onChange={setters.fromEvent("lastName")} />
    </>
);

export default HOC(HOCProps, {
    initialState: {
        lastName: "Young"
    }
});
