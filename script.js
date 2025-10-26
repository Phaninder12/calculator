let display = document.getElementById("display");
let memory = 0; // Memory storage for M+, M-, MR, MC

// Append value to display (digits, operators, etc.)
function appendValue(value) {
  display.value += value;
}

// Clear display
function clearDisplay() {
  display.value = "";
}

// Calculate square root of the current input
function sqrt() {
  try {
    let value = parseFloat(display.value);
    if (value < 0) throw new Error("Invalid"); // prevent sqrt of negative numbers
    display.value = Math.sqrt(value);
  } catch {
    display.value = "Error";
  }
}

// Perform calculation with BODMAS order of operations
function calculate() {
  try {
    let result = evaluateExpression(display.value); // custom parser
    display.value = result;
  } catch (error) {
    display.value = "Error"; // invalid input or division by zero
  }
}

// Convert infix expression (e.g. "2+3*4") to postfix using Shunting Yard
// Then evaluate postfix to get the result
function evaluateExpression(expr) {
  let outputQueue = [];  // holds postfix expression
  let operatorStack = []; // holds operators during conversion
  let operators = {
    "+": { precedence: 1, assoc: "L" },
    "-": { precedence: 1, assoc: "L" },
    "*": { precedence: 2, assoc: "L" },
    "/": { precedence: 2, assoc: "L" },
    "%": { precedence: 2, assoc: "L" } // percentage treated as operator
  };

  // Tokenize input (split numbers and operators)
  let tokens = expr.match(/(\d+(\.\d+)?)|[+\-*/%]/g);
  if (!tokens) throw new Error("Invalid Expression");

  // Convert infix → postfix
  tokens.forEach(token => {
    if (!isNaN(token)) {
      outputQueue.push(parseFloat(token)); // number → send to output
    } else if (token in operators) {
      let o1 = token;
      let o2 = operatorStack[operatorStack.length - 1];
      // pop operators with higher or equal precedence
      while (
        o2 in operators &&
        ((operators[o1].assoc === "L" && operators[o1].precedence <= operators[o2].precedence))
      ) {
        outputQueue.push(operatorStack.pop());
        o2 = operatorStack[operatorStack.length - 1];
      }
      operatorStack.push(o1);
    }
  });

  // Pop remaining operators to output
  while (operatorStack.length) {
    outputQueue.push(operatorStack.pop());
  }

  // Evaluate postfix expression
  let stack = [];
  outputQueue.forEach(token => {
    if (typeof token === "number") {
      stack.push(token);
    } else {
      let b = stack.pop();
      let a = stack.pop();
      switch (token) {
        case "+": stack.push(a + b); break;
        case "-": stack.push(a - b); break;
        case "*": stack.push(a * b); break;
        case "/":
          if (b === 0) throw new Error("Division by zero");
          stack.push(a / b);
          break;
        case "%": stack.push(a * b / 100); break; // percentage (modulus)
      }
    }
  });

  return stack[0];
}

/* ------------------ MEMORY FUNCTIONS ------------------ */

// Clear memory
function memoryClear() {
  memory = 0;
}

// Recall memory (append stored value to display)
function memoryRecall() {
  display.value += memory;
}

// Add current display value to memory
function memoryAdd() {
  memory += parseFloat(display.value) || 0;
}

// Subtract current display value from memory
function memorySubtract() {
  memory -= parseFloat(display.value) || 0;
}

/* ------------------ KEYBOARD SUPPORT ------------------ */
document.addEventListener("keydown", (event) => {
  if (!isNaN(event.key) || "+-*/.%".includes(event.key)) {
    appendValue(event.key); // digits and operators
  } else if (event.key === "Enter") {
    calculate(); // Enter = "="
  } else if (event.key === "Backspace") {
    display.value = display.value.slice(0, -1); // delete last character
  } else if (event.key.toLowerCase() === "c") {
    clearDisplay(); // "C" = clear
  }
});
