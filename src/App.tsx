import React, { useEffect, useReducer } from "react";
import "./App.css";
import { ethers } from "ethers";
import type { BigNumberish } from "ethers";

type State = {
  contractAddress: string;
  tokenAddress: string;
  daoContractAddress: string;
  daoBalance: string;
  tokenName: string;
  tokenSupply: string;
};

type Action = Record<string, any>;

const initialState: State = {
  contractAddress: "0x799ebfabe77a6e34311eeee9825190b9ece32824", // Braintrust Contract
  tokenAddress: "0x799ebfabe77a6e34311eeee9825190b9ece32824", // BTRST Token
  daoContractAddress: "0xb6f1F016175588a049fDA12491cF3686De33990B", // Braintrust DAO Contract
  daoBalance: "",
  tokenName: "",
  tokenSupply: "",
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "update":
      return {
        ...state,
        ...action.payload,
      };
    default:
      throw new Error();
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // const provider = ethers.getDefaultProvider("ropsten"); // Test Net
    const provider = ethers.getDefaultProvider(); // Main Net
    const { commify, formatUnits } = ethers.utils;

    const abi = [
      // Read-Only Functions
      "function balanceOf(address owner) view returns (uint256)",
      "function totalSupply() view returns (uint256)",
      "function symbol() view returns (string)",
    ];

    const erc20 = new ethers.Contract(state.tokenAddress, abi, provider);

    erc20.symbol().then((tokenName: string) => {
      dispatch({
        type: "update",
        payload: { tokenName: tokenName },
      });
    });

    erc20.totalSupply().then((tokenSupply: BigNumberish) => {
      const balance = formatUnits(tokenSupply).split(".")[0];
      const formatBalance = commify(balance);

      dispatch({
        type: "update",
        payload: { tokenSupply: formatBalance },
      });
    });

    erc20
      .balanceOf(state.daoContractAddress)
      .then((btrstBalance: BigNumberish) => {
        const balance = formatUnits(btrstBalance).split(".")[0];
        const formatBalance = commify(balance);

        dispatch({
          type: "update",
          payload: { daoBalance: formatBalance },
        });
      });
  }, [state.tokenAddress, state.daoContractAddress]);

  return (
    <div className="App">
      <p>
        Total token supply: {state.tokenSupply} {state.tokenName}
      </p>
      <p>
        DAO Balance: {state.daoBalance} {state.tokenName}
      </p>
    </div>
  );
}

export default App;
