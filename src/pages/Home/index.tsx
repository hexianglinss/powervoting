import React, {useEffect, useState} from "react";
import { Empty } from "antd";
import InfiniteScroll from 'react-infinite-scroll-component';
import {useNetwork, useAccount} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import { apolloClient } from "../../utils/apollo";
import {PROPOSAL_QUERY_ALL, PROPOSAL_QUERY} from "../../utils/queries";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  VOTE_ALL_STATUS,
  IN_PROGRESS_STATUS,
  VOTE_COUNTING_STATUS,
  COMPLETED_STATUS,
  VOTE_FILTER_LIST,
  VOTE_LIST,
  web3AvatarUrl,
  filecoinMainnetChain,
} from '../../common/consts';
import ListFilter from "../../components/ListFilter";
import EllipsisMiddle from "../../components/EllipsisMiddle";
import './index.less';

dayjs.extend(utc);
dayjs.extend(timezone);

const Home = () => {
  const navigate = useNavigate();
  const {chain} = useNetwork();

  const {isConnected} = useAccount();
  const {openConnectModal} = useConnectModal();

  const [filterList, setFilterList] = useState([
    {
      label: "All",
      value: VOTE_ALL_STATUS
    }
  ])

  const [voteStatus, setVoteStatus] = useState(VOTE_ALL_STATUS);

  const [votingList, setVotingList] = useState<any>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    initVoteList();
  }, [chain, voteStatus])

  const initVoteList = () => {
    const params = {
      preList: [],
      first: 5,
      skip: 0,
      resetPage: true
    }
    getVoteList(params);
  }

  const getVoteList = async (params: any) => {
    const { preList, first, skip, resetPage } = params;
    const variables = {
      first,
      skip,
      orderBy: 'proposalId',
      orderDirection: 'desc',
    }
    try {
      let queryResult;
      let proposalsLength = 0;
      let filteredProposals = [];

      const chainId = chain?.id || filecoinMainnetChain.id;
      // @ts-ignore
      switch (voteStatus) {
        case VOTE_ALL_STATUS:
          queryResult = await queryAllProposals(chainId, variables);
          break;
        case IN_PROGRESS_STATUS:
          queryResult = await queryProposal(chainId, voteStatus, variables);
          break;
        case COMPLETED_STATUS:
          queryResult = await queryProposal(chainId, voteStatus, variables);
          break;
        case VOTE_COUNTING_STATUS:
          queryResult = await queryAllProposals(chainId, variables);
          break;
      }
      proposalsLength = queryResult?.data.proposals.length;
      filteredProposals = queryResult?.data.proposals?.filter((item: any) => {
        if (voteStatus === IN_PROGRESS_STATUS) {
          return item.status === IN_PROGRESS_STATUS && Number(item.expTime) > dayjs().unix();
        } else if (voteStatus === VOTE_COUNTING_STATUS) {
          return item.status === IN_PROGRESS_STATUS && Number(item.expTime) <= dayjs().unix();
        }
        return true;
      });

      setPage(page => resetPage ? 1 : page + 1);
      setHasMore(proposalsLength > 4);
      const list = await getList(filteredProposals) || [];
      setFilterList(VOTE_FILTER_LIST);
      setVotingList([...preList, ...list]);
    } catch (error) {
      console.log(error);
    }
  }
  const getList = async (proposals: any) => {
    const ipfsUrls = proposals.map(
      (_item: any) => `https://${_item.cid}.ipfs.nftstorage.link/`
    );
    try {
      const responses = await Promise.all(ipfsUrls.map((url: string) => axios.get(url)));
      const results = responses.map((res: any, i: number) => {
        const now = dayjs().unix();
        const voteStatus =
          proposals[i].status === IN_PROGRESS_STATUS && now >= res.data.Time
            ? VOTE_COUNTING_STATUS
            : proposals[i].status;
        const option = res.data.option?.map((item: any, index: number) => {
          const voteItem = proposals[i]?.voteResults?.find(
            (vote: any) => vote.optionId.toString() === index.toString()
          );
          return {
            name: item,
            count: voteItem?.votes ? Number(voteItem.votes) : 0,
          };
        });
        return {
          ...res.data,
          id: proposals[i].id,
          cid: proposals[i].cid,
          option,
          voteStatus,
        };
      });
      return results;
    } catch (error) {
      console.error(error);
    }
  };

  const queryProposal = async (chainId: number, voteStatus: number, variables: any) => {
    return await apolloClient(chainId).query({
      query: PROPOSAL_QUERY,
      variables: {
        ...variables,
        status: voteStatus
      }
    });
  };

  const queryAllProposals = async (chainId: number, variables: any) => {
    return await apolloClient(chainId).query({
      query: PROPOSAL_QUERY_ALL,
      variables
    });
  };
  const handleFilter = async (status: number) => {
    setVoteStatus(status);
  }

  const handleJump = (item: any) => {
    const router = `/${item.voteStatus === COMPLETED_STATUS ? "votingResults" : "vote"}/${item.id}/${item.cid}`;
    navigate(router, {state: item});
  }

  const handleCreate = () => {
    if (!isConnected) {
      openConnectModal && openConnectModal();
      return false;
    }
    navigate("/createpoll");
  }

  const renderList = (item: any, index: number) => {
    const total = item.option?.reduce(((acc: number, current: any) => acc + current.count), 0);
    const max = Math.max(...item.option?.map((option: any) => option.count));
    const vote = VOTE_LIST?.find((vote: any) => vote.value === item.voteStatus)

    return (
      <div
        key={item.cid + index}
        className="rounded-xl border border-[#313D4F] bg-[#273141] px-[30px] py-[12px] mb-8"
      >
        <div className="flex justify-between mb-3">
          <a
            target='_blank'
            rel="noopener"
            href={`${chain?.blockExplorers?.default.url}/address/${item.Address}`}
            className="flex justify-center items-center"
          >
            <img className="w-[20px] h-[20px] rounded-full mr-2" src={`${web3AvatarUrl}:${item.Address}`} alt="" />
            <div className="truncate text-white">
              {EllipsisMiddle({suffixCount: 4, children: item.Address})}
            </div>
            {/*<div className='ml-1 rounded-full border px-[7px] text-xs text-skin-text'>{item.ProposalType}</div>*/}
          </a>
          <div
            className={`${vote?.color} h-[26px] px-[12px] text-white rounded-xl`}>
            { vote?.label }
          </div>
        </div>
        <div className="relative mb-4 line-clamp-2 break-words break-all text-lg pr-[80px] leading-7  cursor-pointer"
             onClick={() => {
               handleJump(item)
             }}>
          <h3 className="inline pr-2 text-2xl font-semibold text-white">
            {item.Name}
          </h3>
        </div>
        <div className="mb-2 line-clamp-2 break-words text-lg cursor-pointer" onClick={() => {
          handleJump(item)
        }}>
          {item.Descriptions}
        </div>
        {
          item.voteStatus === COMPLETED_STATUS &&
            <div>
              {
                item.option?.map((option: any, index: number) => {
                  const percent = option.count ? ((option.count / total) * 100).toFixed(2) : 0;
                  return (
                    <div className="relative mt-1 w-full" key={option.name + index}>
                      <div className="absolute ml-3 flex items-center leading-[43px] text-white">
                        {
                          option.count > 0 && option.count === max &&
                            <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" className="-ml-1 mr-2 text-sm">
                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2" d="m5 13l4 4L19 7"></path>
                            </svg>
                        }
                        {option.name} <span className="ml-2 text-[#8b949e]">{option.count} Vote(s)</span></div>
                      <div className="absolute right-0 mr-3 leading-[40px] text-white">{percent}%</div>
                      <div className="h-[40px] rounded-md bg-[#1b2331]" style={{width: `${percent}%`}}></div>
                    </div>
                  )
                })
              }
            </div>
        }
        <div className="text-[#8B949E] text-sm mt-4">

          <span className="mr-2">Expiration Time:</span>
          {dayjs(item.showTime).format('MMM.D, YYYY, h:mm A')} ({item.GMTOffset})
        </div>
      </div>
    )
  }

  return (
    <div className="home_container main">
      <div className="flex justify-between items-center rounded-xl border border-[#313D4F] bg-[#273141] mb-8 px-[30px]">
        <div className="flex justify-between">
          <ListFilter
            name="Status"
            value={voteStatus}
            list={filterList}
            onChange={handleFilter}
          />
        </div>
        <button
          className="h-[40px] bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded-xl"
          onClick={handleCreate}
        >
          Create A Proposal
        </button>
      </div>
      {
        votingList.length > 0 ?
          <div className='home-table overflow-auto'>
            <InfiniteScroll
              dataLength={votingList.length}
              next={() => {
                getVoteList({
                  preList: votingList,
                  first: pageSize,
                  skip: page * pageSize,
                  resetPage: false
                });
              }}
              hasMore={hasMore}
              scrollableTarget="scrollBox"
              scrollThreshold={0.99}
              loader={<p className='loading text-center'>Loading...</p>}
              endMessage={<p className='text-center'>No More Proposals</p>}
            >
              {
                votingList.map((item: any, index: number) => renderList(item, index))
              }
            </InfiniteScroll>
          </div> :
          <Empty
            className='empty'
            description={
              <span className='text-white'>No Data</span>
            }
          />
      }
    </div>
  )
}

export default Home;
