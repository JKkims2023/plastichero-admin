// 보안 무작위 수 생성기 셤 적용 (ethers 셤보다 먼저 적용)
// ethers.js 셤 적용
import '@ethersproject/shims'; //React Native 환경에서 ethers.js가 동작하도록 하는 셤(shim)
// ethers 라이브러리 임포트
import { ethers, providers } from 'ethers'; //이더리움 블록체인과 상호작용하기 위한 ethers.js v5.7.2
import { EncryptOptions } from 'ethers/lib/utils';


// 지갑 저장소 키
const KEY_WALLETS = "storage_wallets_encrypted";

interface StorageWalletData {
    mainwallet: boolean;
    tag: string;
    encrypted: string;
    address: string;
    wallet:{}
}


const RPC_URL = `https://test-rpc.plasticherokorea.com`
const API_URL = `https://test-explorer.plasticherokorea.com/api`


export enum ERROR_CODE {
    SUCCESS = 200,
    IMPORT_EMPTY_PRIVATE_KEY = 1,
    IMPORT_PRIVATE_KEY_FAILED = 2,
    ENCRYPTION_FAILED = 3,
    DECRYPTION_FAILED = 4,
    NOT_FOUND_WALLET = 5,
    INVALID_PRIVATE_KEY = 6,
    FAIL_QUERY_BALANCE = 7,
    FAIL_QUERY_TOKEN_BALANCE = 8,
    FAIL_SEND_COIN = 9,
    FAIL_SEND_TOKEN = 10,
    FAIL_QUERY_TRANSACTION = 11,
}

interface WalletResult {
    error_code: ERROR_CODE;
    data: any;
}


class WalletLib {
    #wallets: StorageWalletData[] = [];

    constructor() {

    }

    /** privatekey를 10진수 숫자 문자열로 변환 */
    privateKeyToDecimal(privateKey: string): string {
        const decimalPrivateKey = BigInt(privateKey).toString(10);
        return decimalPrivateKey
    }
    /** 10진수 숫자 문자열을 16진수 문자열로 변환 */
    decimalToHex(decimal: string): string {
        const hexPrivateKey = BigInt(decimal).toString(16);
        return hexPrivateKey
    }

    async #importWallet(privateKey: string|null, password: string): Promise<WalletResult> {
        
        let wallet = null;
        
        try {
            
            if(privateKey === null) {
                const randomBytes = ethers.utils.randomBytes(32);
                privateKey = ethers.utils.hexlify(randomBytes);
                // wallet = ethers.Wallet.createRandom();
            } else {
                // wallet = new ethers.Wallet(privateKey);
            }

            wallet = new ethers.Wallet(privateKey);
        
        } catch(error) {
            return {
                error_code: ERROR_CODE.INVALID_PRIVATE_KEY,
                data: null
            };
        }

        try {
            
            let newInfo = undefined
            
            // const options: EncryptOptions = { scrypt: { N: 1 << 14} } // N 값을 줄여서 속도 개선
            const options: EncryptOptions = { scrypt: { N: 1 << 6} } // N 값을 줄여서 속도 개선

            
            {
                const fIdx = this.#wallets.findIndex(item => item.address.toLowerCase() === wallet.address.toLowerCase())
                const encrypted = await wallet.encrypt(password, options)
                if(fIdx !== -1) {
                    newInfo = {...this.#wallets[fIdx], encrypted: encrypted}
                    this.#wallets[fIdx] = newInfo
                } else {
                    newInfo = {
                        mainwallet: this.#wallets.length === 0,
                        tag: `PTH Wallet${this.#wallets.length}`,
                        encrypted: encrypted,
                        address: wallet.address
                    }
                  //  this.#wallets.push(newInfo)
                }
            }
        
         //   addStorageWalletData(newInfo)
        
        } catch(error) {
            return {
                error_code: ERROR_CODE.ENCRYPTION_FAILED,
                data: null
            };
        }
        return {
            error_code: ERROR_CODE.SUCCESS,
            data: wallet,
 
        };
    }
    
    #getProvider(): providers.JsonRpcProvider {
        return new providers.JsonRpcProvider({url : RPC_URL});
    }
    /**잔액확인(코인) */
    async getCoinBalance(address:string, isEtherFormat:boolean = false): Promise<WalletResult> {
        try {
            const provider = this.#getProvider()
            const balance = await provider.getBalance(address);

            if(isEtherFormat) {
                return {
                    error_code: ERROR_CODE.SUCCESS,
                    data: ethers.utils.formatEther(balance.toString())
                }
            }
            return {
                error_code: ERROR_CODE.SUCCESS,
                data: balance.toString()
            }
        } catch(error) {
            console.log('Error coinBalance:', error);
        }
        return {
            error_code: ERROR_CODE.FAIL_QUERY_BALANCE,
            data: '0'
        }
    }
    /**잔액확인(토큰) */
    async getTokenBalance(address:string, erc20:string, isEtherFormat:boolean = false): Promise<WalletResult> {
        try {
            const provider = this.#getProvider()
            const abi = [
                {
                    "inputs": [
                    {
                        "internalType": "address",
                        "name": "account",
                        "type": "address"
                    }
                    ],
                    "name": "balanceOf",
                    "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];
            const iface = new ethers.utils.Interface(abi);
            const data = iface.encodeFunctionData("balanceOf", [address]);
            const res = await provider.call({ to: erc20, data: data});
            const decodedBalance = ethers.utils.defaultAbiCoder.decode(["uint256"], res);
            const result = decodedBalance[0];
            const balance = result.toString()

            if(isEtherFormat) {
                return {
                    error_code: ERROR_CODE.SUCCESS,
                    data: ethers.utils.formatEther(balance.toString()) 
                }
            }
            return {
                error_code: ERROR_CODE.SUCCESS,
                data: balance
            }
        } catch(error) {
            console.log('Error tokenBalance:', error);
        }
        return {
            error_code: ERROR_CODE.FAIL_QUERY_TOKEN_BALANCE,
            data: '0'
        }
    }
    async getGasPrice(): Promise<BigInt> {
        
    
        const provider = this.#getProvider();


        const gasPrice = await provider.getGasPrice();
        const gasPriceBigInt = BigInt(gasPrice.toString());
        const gasPriceMultiplier = BigInt(13);
        const gasPriceDivisor = BigInt(10);
        const gasPrice_1_3 = (gasPriceBigInt * gasPriceMultiplier) / gasPriceDivisor;
        return gasPrice_1_3
    }

    /**전송(코인) amount = ether단위 string */
    async sendCoin(restore_key:string, to: string, amount: string): Promise<WalletResult> {
            
        const wallet = new ethers.Wallet(restore_key, this.#getProvider());

        console.log('wallet step1');

        if(!wallet) {
            
            return {
                error_code: ERROR_CODE.NOT_FOUND_WALLET,
                data: null
            };
        }

        console.log('wallet step2');

        const gasPrice = await this.getGasPrice();

        console.log('wallet step3');
        const nonce = await wallet.getTransactionCount('latest');

        console.log('wallet step4');

        console.log('wallet : ' + wallet);
        console.log('restore_key : ' + restore_key);
        console.log('to : ' + to);
        console.log('amount : ' + amount);
        console.log('gasPrice : ' + gasPrice);
        console.log('nonce : ' + nonce);

        //@ts-ignore
        const tx = await wallet.sendTransaction({ to, value: ethers.utils.parseEther(amount), nonce: nonce, gasPrice: gasPrice });
        
        console.log('wallet step4');

        if(!tx) {

            return {
            
                error_code: ERROR_CODE.FAIL_SEND_COIN,
                data: null
            
            };
        }

        return {

            error_code: ERROR_CODE.SUCCESS,
            data: tx.hash
        };
    }

    /** 트랜잭션 조회 */
    async queryTransaction(address:string, offset:number, page:number): Promise<WalletResult> {

        try {

            const url = `${API_URL}?module=account&action=txlist&sort=desc&address=${address}&page=${page}&offset=${offset}`
            const res = await fetch(url)
            const data = await res.json()


            if(data.result != null && data.result.length >= 0) {
                return {
                    error_code: ERROR_CODE.SUCCESS,
                    data: data.result
                }
            }else{
                return {
                    error_code: ERROR_CODE.SUCCESS,
                    data: []
                }
            }
        } catch(error) {
            console.log('Error queryTransaction:', error);
        }
        return {
            error_code: ERROR_CODE.FAIL_QUERY_TRANSACTION,
            data: []
        }
    }


    /**ether 표기를 wei로 변환(ex: 0.1255 -> 125500000000000000) */
    eth2wei(amount: string): string {
        return ethers.utils.parseEther(amount).toString()
    }
    /**wei 표기를 ether로 변환(ex: 125500000000000000 -> 0.1255) */
    wei2eth(amount: string): string {
        return ethers.utils.formatEther(amount)
    }

}


export const walletLib = new WalletLib();
