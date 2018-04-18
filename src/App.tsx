import * as React from "react";
import { RenderProps } from "./RenderProps";
import FullComponent from "./full";

export const App: React.SFC<{}> = () => (
    <>
        <RenderProps />
        <FullComponent firstName="Alex" />
    </>
);
