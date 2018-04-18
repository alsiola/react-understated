# react-understated

This is some experimentation around creating an alternative React state API. If it is useful then it could be published.

## Try it out locally
```
git clone https://github.com/alsiola/react-understated.git
cd react-understated
yarn
yarn start
```

## The Basics
We all love functional components in React (well I do anyway).  We don't love having to refactor them into class components just to add a little bit of state management.  The idea here is to abstract that state management into its own component, and pass the resulting state, and functions to alter it as arguments to a render function.

### A Boolean Toggle

````
const MyComponent = () => (
    <Understated initialState={{ isItGood: false }}>
        {({ state: { toggle }, setters }) => (
            <>
                This library is {isItGood ? "AWESOME-O" : "weaksauce"}

                <button onClick={setters.toggle("isItGood")}>Flip it</button>
            </>
        )}
    </Understated>
)
````

By providing commonly used functions to update state (like toggle above), we minimise the amount of repeated logic throughout an application.  A common scenario is getting the value of an input when it changes:

### Managing a form component

````
const MyComponent = () => (
    <Understated initialState={{ name: "" }}>
        {({ state: { name }, setters }) => (
            <>
                My name is: {name}

                <input onChange={setters.fromEvent("name")} value={name} />
            </>
        )}
    </Understated>
)
````

There are a few other built in state helpers.  I might even document them at some point.  More excitingly you can provide your own! 

### Making your own state helper

Let's square a number!

````
const MyComponent = () => (
    <Understated
        initialState={{ size: 0 }}
        setters={{
            square: x => x * x
        }}
    >
        {({ state: { size }, setters }) => (
            <>
                The number is {size}.
                
                <button onClick={setters.square("size")}>Square me</button>
            </>
        )}
    </Understated>
)
````

Because I am a kind person who spent a few hours writing ridiculous TypeScript, your custom helpers are still type-safe! If you try and pass a state property to square that isn't a number then boom, compiler error.

### Higher Order Component
We all love functional purity and referential transparency. I mean I do, and you'd be silly to disagree with me.  Understated's higher order component can give you a pretty little API that looks like I would like it to:

```
const MyComponent = (props, { state, setters }) => (
    <div>{props.name}</div>
);

export default HOC({
    initialState: {
        name: "Alex"
    }
})(MyComponent);
```

Typescript support comes via the USComponent type:

```
interface MyPropsInterface {
    name: string;
}

interface MyStateInterface {
    age: number;
}

const MyComponent: USComponent<MyPropsInterface, MyStateInterface> = ({ name }, { state: { age }, setters }) => (
    <>
        <div>{props.name} is {age} years old!</div>
        <button onClick={setters.increment("age")}>Click on {name}'s birthday</button>
    </>
);

export default HOC({
    initialState: {
        name: "Alex"
    }
})(MyComponent);
```