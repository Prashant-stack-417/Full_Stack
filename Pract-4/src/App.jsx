import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const incrementCount = (amount) => {
    console.log(amount);
    setCount(count + amount);
  };

  const buttons = [
    { label: "Increment", amount: 1 },
    { label: "Decrement", amount: -1 },
    { label: "Increment 5", amount: 5 },
  ];
  return (
    <div>
      <h1>Count : {count}</h1>
      <button onClick={() => setCount(0)}>Reset</button>
      {buttons.map((item, idx) => {
        return (
          <button key={idx} onClick={() => incrementCount(item.amount)}>
            {item.label}
          </button>
        );
      })}
      <h1>Welcome To Charusat</h1>
      <label>First Name</label>{" "}
      <input
        type="text"
        name="fname"
        id="fname"
        value={fname}
        onChange={(e) => setFname(e.target.value)}
      />
      <br />
      <label>Last Name</label>{" "}
      <input
        type="text"
        name="lname"
        id="lname"
        value={lname}
        onChange={(e) => setLname(e.target.value)}
      />

      <p>First Name: {fname}</p>
      <p>Last Name: {lname}</p>
    </div>
  );
}

export default App;
