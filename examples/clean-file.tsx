// This is an example of a clean file with no issues

import React, { useState } from 'react';

export const CleanComponent: React.FC = () => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <input type="text" value={value} onChange={handleChange} />
      <p>You typed: {value}</p>
    </div>
  );
};

export default CleanComponent;
