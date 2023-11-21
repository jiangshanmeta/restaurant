import React, {  useEffect, useState } from 'react';
import Web3 from 'web3';
import {contractJSON} from './ContractJSON';

interface RestaurantModel {
    name:string;
    count:number;
}

interface Voter {
     hasAccess:boolean;
     isVoted:boolean;
     targetIndex:bigint;
}


function Restaurant(){
    const [web3] = useState(()=> new Web3(window.ethereum))
    const [accounts,setAccounts] = useState<string[]>([]);
    const [blockNumber,setBlockNumber] = useState(0 as unknown as bigint)
    const [gasPrice,setGasPrice] = useState(0 as unknown as bigint);
    // TODO update contractAddress

    const [contract] = useState(()=>new web3.eth.Contract(contractJSON.abi,'0x0738201d4a51b391ea941F70206055A24F44F889')  )
    const [restaurants,setRestaurants] = useState<RestaurantModel[]>([])
    const [contractOwner,setContractOwner] = useState('')
    const [ownerVoter,setOwnerVoter] = useState<Voter | null>(null)
    const [currentAddressVoter,setCurrentAddressVoter] = useState<Voter | null>(null)

    const [approveAddress,setApproveAddress] = useState('');


    async function getVoteResult(){

        setRestaurants(await contract.methods.getVoteResult().call())
        
    }


    async function getBCInfo(){
        try{
            const _account = await  window.ethereum!.request({ method: 'eth_requestAccounts' }) as string[]
            setAccounts( _account )
            setBlockNumber(await web3.eth.getBlockNumber())
            setGasPrice(await web3.eth.getGasPrice());
        }catch(e){
            console.log('---->',e)
        }

    }

     function getOwnerVoter(address:string){
        return contract.methods.getVoter(address).call().then((_res)=>{
            setOwnerVoter(_res as any)
        })

    }

    async function approve() {
        return contract.methods.approve(approveAddress).send({from:accounts[0]})
    }

    async function vote(voteIndex:number) {
        await contract.methods.vote(voteIndex).send({from:accounts[0]})
        await getVoteResult()
    }

    

    useEffect(()=>{
        window.ethereum!.on('accountsChanged',(newAccounts)=>{
            console.log('account changed')
            setAccounts(newAccounts as string[])
        })
        

        getBCInfo().then(()=>{
            getVoteResult()
        
            contract.methods.owner().call().then((_owner)=>{
                setContractOwner(_owner)
                getOwnerVoter(_owner)
            })
    
            // TODO events don't know why
            const votedEvent = contract.events.Voted({
                fromBlock:0,
            })
            votedEvent.on('data',(first)=>{
                console.log('data--->',first)
                
            })
               
            votedEvent.on('changed',(...arg)=>{
                console.log('changed',arg)
            })
            
            votedEvent.on('connected',(...arg)=>{
                console.log('connected--->',arg)
            })
        })



    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect(()=>{
        if(accounts.length === 0){
            return;
        }
        contract.methods.voters(accounts[0]).call().then((_res)=>{
            setCurrentAddressVoter(_res as any)
        })



    },[accounts,contract])



    return (
        <div>
            <section>
                <h2>basic info</h2>
                <div>current block {blockNumber.toString()}</div>
                <div>gas price {gasPrice.toString()}</div>
            </section>
            <section>
                <h2>account info</h2>
                <ul>
                    {
                        accounts.map((account)=>{
                            return (<li key={account}>{account}</li>)
                        })
                    }
                </ul>
            </section>
            <section>
                <h2>restraurant part</h2>
                <div>owner: {contractOwner}</div><br/>
                <div>owner voteInfo: 
                    {
                        ownerVoter && <div>
                            <div>hasAccess: {String(ownerVoter.hasAccess)}</div>
                            <div>isVoted: {String(ownerVoter.isVoted)}</div>
                            <div>targetIndex: {String(ownerVoter.targetIndex)}</div>
                        </div>
                    }
                </div>
                <br/>
                <div>current address voteInfo: 
                    {
                        currentAddressVoter && <div>
                            <div>hasAccess: {String(currentAddressVoter.hasAccess)}</div>
                            <div>isVoted: {String(currentAddressVoter.isVoted)}</div>
                            <div>targetIndex: {String(currentAddressVoter.targetIndex)}</div>
                        </div>
                    }
                </div>


                <ul>
                {
                    restaurants.map((restaurant,index)=>{
                        return (
                            <li key={restaurant.name}>
                                name: {restaurant.name} 
                                count {restaurant.count.toString()}
                                {
                                    currentAddressVoter?.hasAccess && !currentAddressVoter.isVoted && <button onClick={()=>vote(index)  }>vote</button>
                                }
                                
                            </li>
                        )
                    })
                }
                </ul>

                <br/>

                {
                    accounts.length && accounts[0].toLowerCase() === contractOwner.toLowerCase() && (
                        <div>
                        <input value={approveAddress} onChange={(e)=>setApproveAddress(e.target.value)}/>
                        <button onClick={approve}>approve</button>
                    </div>
    
                    )
                }

                <br/>


            </section>

        </div>
    )

}


export default Restaurant