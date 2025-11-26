// Example file with various issues for testing CodeDetox

import React from 'react';
import { useState, useEffect } from 'react';
import moment from 'moment';  // ❌ Unused import
import _ from 'lodash';  // ❌ Unused import

// ✅ This is used
export const ExampleComponent = () => {
  const [count, setCount] = useState(0);
  const unusedVar = 'test';  // ⚠️ Unused variable

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

// ⚠️ Unused function
function unusedFunction() {
  return 'never called';
}

// ⚠️ Unreachable code
function hasUnreachableCode() {
  return true;
  console.log('This will never run');  // Unreachable
}

// ⚠️ Empty catch block
function emptyCatch() {
  try {
    throw new Error('oops');
  } catch (e) {
    // Empty - silently ignoring errors
  }
}
