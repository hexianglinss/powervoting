import { ethers } from "ethers";
import { NFTStorage, Blob } from 'nft.storage';
import fileCoinAbi from "../../contracts/powervoting/PowerVoting_filecoin.json";
import ethAbi from "../../contracts/powervoting/PowerVoting.json";
import {
  filecoinMainnetContractAddress,
  contractAddressList,
  NFT_STORAGE_KEY,
  filecoinMainnetChain,
} from "../common/consts";
import {filecoinCalibration} from "wagmi/chains";

export const useDynamicContract = (chainId: number) => {
  const isFileCoinChain = [filecoinMainnetChain.id, filecoinCalibration.id].includes(chainId);

  const contractAddress = contractAddressList.find((item: any) => item.id === chainId)?.address || filecoinMainnetContractAddress;
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const abi = isFileCoinChain ? fileCoinAbi : ethAbi;

  const contract = new ethers.Contract(contractAddress, abi, signer);

  const decodeError = (data: string) => {
    const errorData = data.substring(0, 2) + data.substring(10);
    const defaultAbiCoder = new ethers.utils.AbiCoder();
    let decodedData =  '';
    try {
      decodedData = defaultAbiCoder.decode(['string'], errorData)[0]
    } catch (e) {
      console.log(e);
    }
    return decodedData;
  }

  const handleReturn = (params: any) => {
    const { type, data } = params
    let code = 200;
    let msg = 'success';
    if (type === 'error') {
      const encodeData = data?.error?.data?.originalError?.data;
      if (encodeData) {
        code = 401
        msg = decodeError(encodeData) || 'Operation Failed';
      } else {
        code = 402;
        msg = 'Operation Failed';
      }
    }

    return {
      code,
      msg,
      data
    }
  }

  const createVotingApi = async (proposalCid: string, timestamp: number, chainId:number, proposalType: number, id?: number, ) => {
    try {
      let data = {};
      if (isFileCoinChain) {
        data = await contract.createProposal(id, proposalCid, timestamp, chainId, proposalType);
      } else {
        data = await contract.createProposal(proposalCid, timestamp, chainId, proposalType);
      }
      return handleReturn({
        type: 'success',
        data
      })
    } catch (e: any) {
      console.log(e);
      return handleReturn({
        type: 'error',
        data: e
      })
    }
  }

  const voteApi = async (id: number, optionId: string) => {
    try {
      const data = await contract.vote(id, optionId);
      return handleReturn({
        type: 'success',
        data
      })
    } catch (e: any) {
      return handleReturn({
        type: 'error',
        data: e
      })
    }
  }

  const cancelVotingApi = async (id: number) => {
    try {
      const data = await contract.cancelProposal(id);
      return handleReturn({
        type: 'success',
        data
      })
    } catch (e: any) {
      return handleReturn({
        type: 'error',
        data: e
      })
    }
  }

  const isWhiteListApi = async (address: any) => {
    try {
      const data = await contract.allowList(address);
      return handleReturn({
        type: 'success',
        data
      })
    } catch (e: any) {
      console.log(e);
      return handleReturn({
        type: 'error',
        data: e
      })
    }
  }

  return {
    createVotingApi,
    cancelVotingApi,
    voteApi,
    isWhiteListApi
  }
}

/**
 * Reads an image file from `imagePath` and stores an NFT with the given name and description.
 * @param {object} params for the NFT
 */
const storeIpfs = (params: object) => {
  const json = JSON.stringify(params);
  const data = new Blob([json]);

  const nftStorage = new NFTStorage({ token: NFT_STORAGE_KEY });

  return nftStorage.storeBlob(data);
}

/**
 * The main entry point for the script that checks the command line arguments and
 * calls storeNFT.
 *
 * To simplify the example, we don't do any fancy command line parsing. Just three
 * positional arguments for imagePath, name, and description
 */
export const getIpfsId = async (props: any) => {
  const result = await storeIpfs(props);
  return result;
}