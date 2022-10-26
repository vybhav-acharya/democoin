var{ec}=require('elliptic');
var {existsSync, readFileSync, unlinkSync, writeFileSync}=require( 'fs');
var _ =require('lodash');


const EC = new ec('secp256k1');
const privateKeyLocation = process.env.PRIVATE_KEY || 'private_key';

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
    // let's not override existing private keys
    // if (existsSync(privateKeyLocation)) {
    //     return;
    // }
    const newPrivateKey = generatePrivateKey();

    writeFileSync(privateKeyLocation, newPrivateKey);
    console.log('new wallet with private key created to : %s', privateKeyLocation);
};

const deleteWallet = () => {
    if (existsSync(privateKeyLocation)) {
        unlinkSync(privateKeyLocation);
    }
};





module.exports=  {getPublicFromWallet,
    getPrivateFromWallet, generatePrivateKey, initWallet, deleteWallet};
