import React from 'react';
import Restaurant from './Restaurant'


function App() {


  if(typeof window.ethereum === 'undefined'){
    return (<div>Please install MetaMask to connect with the Ethereum network</div>)
  }

  return <Restaurant />
}

export default App;
