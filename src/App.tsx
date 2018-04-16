import * as React from "react";
import { RenderProps } from "./RenderProps";
import HOCProps from "./full";

export const App: React.SFC<{}> = () => (
    <>
        <RenderProps />
        <hr />
        <HOCProps firstName="Alex" />
    </>
);
