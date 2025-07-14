import { useState } from "react";
import "./App.css";

function App() {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForSecondOperand) {
      setDisplay(String(digit));
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clearDisplay = () => {
    setDisplay("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator);
      setDisplay(String(result));
      setFirstOperand(result);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (firstOperand, secondOperand, operator) => {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "*":
        return firstOperand * secondOperand;
      case "/":
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  };

  // Common button classes for consistent styling
  const buttonClass =
    "h-16 text-2xl font-medium transition-colors duration-200 focus:outline-none";
  const numberButtonClass = `${buttonClass} bg-gray-200 hover:bg-gray-300`;
  const operatorButtonClass = `${buttonClass} bg-amber-500 text-white hover:bg-amber-600`;
  const clearButtonClass = `${buttonClass} bg-red-500 text-white hover:bg-red-600`;
  const equalsButtonClass = `${buttonClass} bg-green-500 text-white hover:bg-green-600`;

  return (
    <div className="calculator-container">
      {/* Calculator container with fixed width and centered */}
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Calculator Display */}
        <div className="bg-gray-800 p-6">
          <div className="text-right text-white text-4xl font-mono truncate">
            {display}
          </div>
        </div>

        {/* Calculator Keypad */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100">
          {/* Clear button */}
          <button
            className={`${clearButtonClass} col-span-2`}
            onClick={clearDisplay}
          >
            AC
          </button>

          {/* Operators */}
          <button
            className={operatorButtonClass}
            onClick={() => performOperation("/")}
          >
            &divide;
          </button>
          <button
            className={operatorButtonClass}
            onClick={() => performOperation("*")}
          >
            &times;
          </button>

          {/* Numbers and operators */}
          <button className={numberButtonClass} onClick={() => inputDigit(7)}>
            7
          </button>
          <button className={numberButtonClass} onClick={() => inputDigit(8)}>
            8
          </button>
          <button className={numberButtonClass} onClick={() => inputDigit(9)}>
            9
          </button>
          <button
            className={operatorButtonClass}
            onClick={() => performOperation("-")}
          >
            -
          </button>

          <button className={numberButtonClass} onClick={() => inputDigit(4)}>
            4
          </button>
          <button className={numberButtonClass} onClick={() => inputDigit(5)}>
            5
          </button>
          <button className={numberButtonClass} onClick={() => inputDigit(6)}>
            6
          </button>
          <button
            className={operatorButtonClass}
            onClick={() => performOperation("+")}
          >
            +
          </button>

          <button className={numberButtonClass} onClick={() => inputDigit(1)}>
            1
          </button>
          <button className={numberButtonClass} onClick={() => inputDigit(2)}>
            2
          </button>
          <button className={numberButtonClass} onClick={() => inputDigit(3)}>
            3
          </button>
          <button
            className={`${equalsButtonClass} row-span-2`}
            onClick={() => performOperation("=")}
            style={{ gridRow: "span 2" }}
          >
            =
          </button>

          <button
            className={`${numberButtonClass} col-span-2`}
            onClick={() => inputDigit(0)}
          >
            0
          </button>
          <button className={numberButtonClass} onClick={inputDecimal}>
            .
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
