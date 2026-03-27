import { Adapter, FetchOptions } from "../adapters/types";
import { CHAIN } from "../helpers/chains";

const FEE_RECEIVER = '0xafF5340ECFaf7ce049261cff193f5FED6BDF04E7'.toLowerCase();

const TOKENS = [
  '0xbb4CdB9CBd36B01bD1cBaEBf2E08E7023b076de6',
  '0xe9e7CEA3DedcA698478E4cbC3F78dF2E8C6E2F8B',
  '0x55d398326f99059fF775485246999027B3197955',
  '0x5EE54869Ecd5E752C31aF095187326D4A4D50e1c',
];

const fetch = async (options: FetchOptions) => {
  const { getLogs, createBalances, startTimestamp, endTimestamp } = options;
  const dailyFees = createBalances();

  const fromBlock = Math.floor(startTimestamp / 15);
  const toBlock = Math.floor(endTimestamp / 15);

  const transferEvent = 'event Transfer(address indexed from, address indexed to, uint256 value)';

  for (const token of TOKENS) {
    try {
      const logs = await getLogs({
        target: token,
        topic: transferEvent,
        params: { to: FEE_RECEIVER },
        fromBlock: toBlock - 5000,
        toBlock: toBlock,
      });

      logs.forEach((log: any) => {
        dailyFees.add(token, log.value);
      });
    } catch (e) {
    }
  }

  return {
    dailyFees,
    dailyRevenue: dailyFees,
  };
};

const adapter: Adapter = {
  version: 2,
  chains: [CHAIN.BSC],
  fetch,
  start: '2026-03-20',
  methodology: {
    Fees: "We track fees sent to the fee receiver address which represents the developer commission for every swap executed via our frontend integration.",
    Revenue: "Developer fees (0.1% per swap) are collected from each trade and sent to the designated fee receiver address.",
  },
};

export default adapter;