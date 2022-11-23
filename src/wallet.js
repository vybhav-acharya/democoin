var{ec}=require('elliptic');
var {existsSync, readFileSync, unlinkSync, writeFile}=require( 'fs');

var _ =require('lodash');

var {hexToBinary,toHexString}=require("./utils")
const EC = new ec('secp256k1');

const privateKeyLocation = process.env.PRIVATE_KEY || '../private/private_key';

const getPrivateFromWallet = () => {
    const buffer = readFileSync(privateKeyLocation, 'utf8');
    return buffer.toString();
};
const getPublicFromWallet = () => {
    const privateKey = getPrivateFromWallet();
    const key = EC.keyFromPrivate(privateKey, 'hex');
    return key.getPublic().encode('hex');
};

const generatePrivateKey = () => {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};

const initWallet = () => {
    const newPrivateKey = generatePrivateKey();
    

    writeFile(privateKeyLocation, newPrivateKey, function (err) {
  if (err) throw err;
  console.log('new wallet with private key created to : %s', privateKeyLocation);
}); 
  
    
};

const deleteWallet = () => {
    if (existsSync(privateKeyLocation)) {
        unlinkSync(privateKeyLocation);
    }
};


const sign=(blockData,sender)=>{
    console.log(`In wallet ${sender}`)
    const ec1 = new ec('secp256k1');
    let key=""
   if(sender=="")
   key=ec1.keyFromPrivate("abcd", 'hex');
else
    key = ec1.keyFromPrivate(getPrivateFromWallet(), 'hex');

    const signature = toHexString(key.sign(blockData.toString()).toDER());
    
    return signature
}
const validateTransaction=(blockData)=>{
    if(blockData.sender=="")
    return true;
   
    console.log("senedr is "+blockData.sender)
    const ec1 = new ec('secp256k1');
    const key = ec1.keyFromPublic(blockData.sender, 'hex');
 
    const validSignature =key.verify(blockData.toString(),blockData.signature)
   
    return validSignature
}

module.exports=  {getPublicFromWallet,
    getPrivateFromWallet, generatePrivateKey, initWallet, deleteWallet,sign,validateTransaction};
