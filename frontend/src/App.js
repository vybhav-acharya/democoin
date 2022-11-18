
import axios from "axios";

import React, { useState, useEffect } from "react";
import "./App.css";
import Button from 'react-bootstrap/Button';
function Miner(transactions){
axios.get("http://localhost:"+(process.env.REACT_APP_HTTP_PORT||3001)+"/mineBlock")
}
async function Addr(port)
{
  return  axios.get("http://localhost:"+(port)+"/address")
  
}


 function App() {
 
  const [balance, setBalance] = useState("");
  const [address, setAddress] = useState("");
  const [addresses, setAddresses] = useState([]);
  
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [peers,setPeers]=useState([])
  const [blocks,setBlocks]=useState([])
  const [transactions,setTransactions]=useState([])
  const [response,setResponse]=useState()
  
 const [timer,setTimer]=useState(0)


 const address_maker=async ()=>{
  
  let abc=[Addr(3001),Addr(3002),Addr(3003)]
  abc=await Promise.all(abc)
  // console.log("in lauda maker",abc)
 abc=abc.map((e,index)=>["node"+(index+1),e.data.address])
  console.log("in address_maker1.1",abc)
  setAddresses(abc)
 return abc
}
useEffect(()=>{address_maker()},[address])




  const handleSubmit = (e) => {
    e.preventDefault()
    const obj={sender,receiver,amount}
    // alert(`The sender is ${sender} , receiver is ${receiver} amount is ${amount}`);
    axios.post("http://localhost:"+(process.env.REACT_APP_HTTP_PORT||3001)+"/mineTransaction",
      obj)
      .then((res)=>{setResponse(res.data.message)})
   
  }
  







  useEffect(() => {
    const timer = setTimeout(() => {
      setTimer(timer+1)
    }, 2000);
    return () => clearTimeout(timer);
  });
  useEffect(() => {
    fetch("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/balance")
      .then((res) => res.json())
  
      .then((data) => setBalance(data.balance));
},[blocks.length]);
  useEffect(() => {
    axios.get("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/address")
  
      .then((res) => setAddress(res.data.address));
  }, []);

  useEffect(() => {
    fetch("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/peers")
      .then((res) => res.json())
  
      .then((data) => setPeers(data));
  },[]);
  useEffect(()=>{
    fetch("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/blocks")
      .then((res) => res.json())
  
      .then((data) => setBlocks(data));
  },[transactions.length])
  useEffect(()=>{
    fetch("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/transactions")
      .then((res) => res.json())
  
      .then((data) => setTransactions(data));
  },[timer])


  return (
    <div className="App">
      <h1>Hello {(process.env.REACT_APP_HTTP_PORT||3001)}</h1>
      <h1>Your balance is:{balance}</h1>
      <h2>Your address is {address}</h2>
      <h3>Your peers are </h3>
      <table class="styled-table">
        <thead>Peers</thead>
        <tbody>
          {peers.map(r=>
            <tr>
            {r}
            </tr>)}
        </tbody>
      </table>
      <h3>Blocks mined {blocks.length}</h3>

      <table class="styled-table">
      <thead>
        <tr>
          <th>Index</th>
          <th>Previous Hash</th>
          <th>Hash</th>
          <th >Sender</th>
          <th >Receiver</th>
          <th >Amount</th>
        </tr>
      </thead>
      <tbody>
      {
        blocks.map(r2=>
          <tr>
          <th>{r2.index}</th>
          <td>{r2.previousHash.substring(0,10)+"..."}</td>
          <td>{r2.hash.substring(0,10)+".."}</td>
          <td>{r2.data.sender.substring(0,50)+".."}</td>
          <td>{r2.data.receiver.substring(0,50)+".."}</td>
          <td>{r2.data.amount}</td>
          </tr>
        )
      }
      </tbody>
      </table>
      
 
      <h3>Transactions Pending {transactions.length}</h3>
      <button class={transactions.length>0?"":"hidden"} onClick={e=>Miner(transactions)} >Wanna Mine? Earn 5</button>

      <h3>Transactions :</h3>
      <div class="formGroup" id="form_boi">
        <label class="label">Sender</label>          
        <input class="input" list="browsers" value={sender} onChange={(e)=>setSender(e.target.value)}/>
      </div>
      <form>
        <div class="formGroup">
        <label class="label">Receiver</label>
        <input class="input"value={receiver} list="browsers" onChange={(e)=>setReceiver(e.target.value)} />
         
        </div>
        <datalist id="browsers">
          {addresses.map(e=>
            <option value={e[1]}>{e[0]}</option>
            )}
          </datalist>
          
        <div class="formGroup">
          <label class="label">Amount</label>
          <input class="input"  value={amount}  onChange={(e)=>setAmount(e.target.value)}/>    
        </div>
        <Button variant="dark" onClick={handleSubmit}>Submit</Button>{' '}
      </form>
      <h2>{response}</h2>
      </div>
  );

      }
export default App;
     
