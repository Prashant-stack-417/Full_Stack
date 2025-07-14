import { useState } from "react";
import "./App.css";

function App() {
  const [display, setDisplay] = useState("0");
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [history, setHistory] = useState("");
  const [result, setResult] = useState("0");

  const inputDigit = (digit) => {
    if (waitingForSecondOperand) {
      setDisplay(String(digit));
      setResult(String(digit));
      setWaitingForSecondOperand(false);
      // Update history with the new digit after operator
      setHistory(history + digit);
    } else {
      const newDisplay = display === "0" ? String(digit) : display + digit;
      setDisplay(newDisplay);
      setResult(newDisplay);
      // Update history with the new digit
      setHistory(history === "0" ? String(digit) : history + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay("0.");
      setResult("0.");
      setWaitingForSecondOperand(false);
      setHistory(history + "0.");
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
      setResult(display + ".");
      setHistory(history + ".");
    }
  };

  const clearDisplay = () => {
    setDisplay("0");
    setResult("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setHistory("");
  };

  const clearLastDigit = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setResult(newDisplay);
      // Also update history by removing the last character
      if (history.length > 0) {
        setHistory(history.slice(0, -1));
      }
    } else {
      setDisplay("0");
      setResult("0");
      // If we're down to the last digit, reset history to empty
      if (history.length <= 1) {
        setHistory("");
      } else {
        setHistory(history.slice(0, -1));
      }
    }
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const calculatedResult = calculate(firstOperand, inputValue, operator);
      setDisplay(String(calculatedResult));
      setResult(String(calculatedResult));
      setFirstOperand(calculatedResult);

      // Update history with the result if equals was pressed
      if (nextOperator === "=") {
        setHistory(`${history} = ${calculatedResult}`);
      }
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);

    // Update history with the operator (except for equals)
    if (nextOperator !== "=") {
      const operatorSymbol = getOperatorSymbol(nextOperator);
      setHistory(history + " " + operatorSymbol + " ");
    }
  };

  const getOperatorSymbol = (op) => {
    switch (op) {
      case "+":
        return "+";
      case "-":
        return "-";
      case "*":
        return "×";
      case "/":
        return "÷";
      default:
        return op;
    }
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
  const clearLastButtonClass = `${buttonClass} bg-orange-400 text-white hover:bg-orange-500`;
  const equalsButtonClass = `${buttonClass} bg-green-500 text-white hover:bg-green-600`;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Calculator container with fixed width and centered */}
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-lg">
        {/* Calculator Display */}
        <div className="bg-gray-800 p-6">
          <div className="text-right text-gray-400 text-sm font-mono truncate mb-1">
            {history || "0"}
          </div>
          <div className="text-right text-white text-4xl font-mono truncate">
            {result}
          </div>
        </div>

        {/* Calculator Keypad - Reorganized for equal columns and rows */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100">
          {/* Row 1 */}
          <button className={clearButtonClass} onClick={clearDisplay}>
            AC
          </button>
          <button className={clearLastButtonClass} onClick={clearLastDigit}>
            C
          </button>
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

          {/* Row 2 */}
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

          {/* Row 3 */}
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

          {/* Row 4 */}
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
            className={equalsButtonClass}
            onClick={() => performOperation("=")}
          >
            =
          </button>

          {/* Row 5 */}
          <button className={numberButtonClass} onClick={() => inputDigit(0)}>
            0
          </button>
          <button className={numberButtonClass} onClick={inputDecimal}>
            .
          </button>
          <button className={numberButtonClass} onClick={() => {}}>
            ±
          </button>
          <button className={operatorButtonClass} onClick={() => {}}>
            %
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
