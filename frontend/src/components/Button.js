import * as React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function BasicButtons({message}) {
  return (
    
      <Button variant="contained">{message}</Button>
    
  );
}