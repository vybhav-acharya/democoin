import axios from "axios"

import React, { useState, useEffect } from "react";
import "./App.css";

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
  const [peeresponse,setPeeresponse]=useState("Not added")
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState(0);
  const [peers,setPeers]=useState([])
  const [blocks,setBlocks]=useState([])
  const [transactions,setTransactions]=useState([])
  const [response,setResponse]=useState()
  
 const [timer,setTimer]=useState(0)


 const address_maker=async ()=>{
  
  let abc=[Addr(3001),Addr(3002),Addr(3003)]
  abc=await Promise.all(abc)

  abc=abc.map((e,index)=>["node"+(index+1),e.data.address])
 
    setAddresses(abc)
  return abc
}
useEffect(()=>{address_maker()},[address])




  const handleSubmit = (e) => {
    e.preventDefault()
    const obj={sender,receiver,amount}
    let mf=addresses.map((e)=>e[1])
    if(isNaN(amount) || amount.length===0 || parseInt(amount)===0)
    {
      setResponse("Amount is invalid")
      return 
    }
    if(mf.includes(receiver))
    {
    // alert(`The sender is ${sender} , receiver is ${receiver} amount is ${amount}`);
    axios.post("http://localhost:"+(process.env.REACT_APP_HTTP_PORT||3001)+"/createTransaction",
      obj)
      .then((res)=>{setResponse(res.data.message)})
    }
    else{
      setResponse(`Receiver is Invalid`)
    }
  }
  



const user=() => {
  switch(process.env.REACT_APP_HTTP_PORT)
  {
    
    case "3001":
      return "Node 1"
  
    case "3002":
      return "Node 2"
     
      case "3003":
      return "Node 3"
  
      default:
        {console.log((process.env.REACT_APP_HTTP_PORT))
        return "chakka"
        }

  }
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
},[blocks.length,peers.length]);
  useEffect(() => {
    axios.get("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/address")
  
      .then((res) => setAddress(res.data.address));
  }, []);

  useEffect(() => {
    fetch("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/peers")
      .then((res) => res.json())
  
      .then((data) => setPeers(data));
  },[peeresponse]);
  useEffect(()=>{
    fetch("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/blocks")
      .then((res) => res.json())
  
      .then((data) => setBlocks(data));
  },[transactions.length,peers.length])
  useEffect(()=>{
    fetch("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/transactions")
      .then((res) => res.json())
  
      .then((data) => setTransactions(data));
  },[timer])
const cond=()=>
{
  if(peers.length>0 || process.env.REACT_APP_HTTP_PORT=="3001")
  return true
  return false
}
const adder=()=>{
  axios.get("http://localhost:"+((process.env.REACT_APP_HTTP_PORT||3001))+"/addPeer")
  .then((res)=>{ console.log(res.body); setPeeresponse(res.body)})
 
  
}
  return (
    <div className="App">
      
      <h1>Welcome {user()} !</h1>
      <h2>Your balance is : {balance}</h2>
      <h3>Your address is :</h3>
      <h5>{address}</h5>
      
      <br className={cond()?"hidden":""} ></br>
        <button class={cond()?"hidden":""} onClick={adder}>Connect to Blockchain</button>
      <h5 class={cond()?"hidden":""}>{peeresponse}</h5>
      <table class="styled-table">
    
        <tbody>
          {peers.map(r=>
            <tr>
            {r}
            </tr>)}
        </tbody>
      </table>
      <h2>Blocks mined : {blocks.length}</h2>

      <table class="styled-table">
      <thead>
        <tr>
          <th>Index</th>
          <th>Previous Hash</th>
          <th>Hash</th>
          <th >Sender</th>
          <th >Receiver</th>
         
          <th>Difficulty</th>
          <th>Nonce</th>
          <th >Amount</th>
          <th>Miner</th>
        </tr>
      </thead>
      <tbody>
      {
        blocks.map(r2=>
          <tr>
          <th>{r2.index}</th>
          <td>{r2.previousHash.substring(0,10)+"..."}</td>
          <td>{r2.hash.substring(0,10)+".."}</td>
          <td>{r2.data.sender.substring(0,10)+".."}</td>
          <td>{r2.data.receiver.substring(0,10)+".."}</td>
        
          <td>{r2.difficulty}</td>
          <td>{r2.nonce}</td>
          <td>{r2.data.amount}</td>
          <td>{r2.miner}</td>
          </tr>
        )
      }
      </tbody>
      </table>
      
 
      <h4>Transactions Pending : {transactions.length}</h4>
      <button class={transactions.length>0?"":"hidden"} onClick={e=>Miner(transactions)} >Wanna Mine? Earn 5</button>

      <h2>Transactions :</h2>
      <div class="formGroup" id="form_boi">
        <label class="label">Sender</label>          
        <input  class="input" list="browsers" value={sender} onChange={(e)=>setSender(e.target.value)}/>
      </div>
      <form>
        <div class="formGroup">
        <label class="label">Receiver</label>
        <input class="input" value={receiver} list="browsers" onChange={(e)=>setReceiver(e.target.value)}/>
       

         
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
        <button onClick={handleSubmit}>Submit</button>
      </form>
      <h2>{response}</h2>
      </div>
  );

      }
export default App;
     
