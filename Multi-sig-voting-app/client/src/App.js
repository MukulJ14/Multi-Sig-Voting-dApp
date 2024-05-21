import Candidate from "./Components/Candidate.js";
import { useState, useEffect } from "react";
import abi from './abi.js';
import "./App.css";

const ethers = require("ethers");

//contract address : 0x5FbDB2315678afecb367f032d93F642f64180aa3


//add getter functions inside the contract to actually access anything through mappings
//to access values of a struct in mapping, first return the promise, then use the variable rather than doing simultaneously
//use ethers@6.7.1 to deploy and use ethers@5.7.2 to run
//if there's an rpc error, cleat activity logs on metamask->settings->advanced->clear

function App() {

  const [arbiterCount, setArbiterCount] = useState(1);
  const [arbiterAddress, setArbiterAddress] = useState("");
  const [arbiterStatus, setArbiterStatus] = useState("");
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [votingContract, setContract] = useState("");
  const [arbiterApprovalAddress, setArbiterApprovalAddress] = useState("");
  const [reasonRevertApproval, setReasonRevertApproval] = useState("");
  const [arbiterDelete, setArbiterDelete] = useState("");
  const [reasonRevertDelete, setReasonRevertDelete] = useState("");
  const [candidateAddress, setCandidateAddress] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [candidateSymbol, setCandidateSymbol] = useState("");
  let [candidates, setCandidates] = useState([]);
  const [reasonRevertCanAdd, setReasonRevertCanAdd] = useState("");

  async function connect() {
    if (window.ethereum) {
      // const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/OvWzTTYUHdmlnsU_0sWsfkn0ol-qPJz7");
      // const provider = new ethers.providers.AlchemyProvider("sepolia", 'OvWzTTYUHdmlnsU_0sWsfkn0ol-qPJz7')
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(0);

      const votingContract = new ethers.Contract("0x3Fa02AD74df767aEEd88C26227Bf04670F3E2923", abi, signer);
      setContract(votingContract);
    }
  }

  useEffect(() => {

    connect();

  }, [])




  async function getCandidatesCount() {
    try {
      let totalCan = await votingContract.getCandidateCount();

      let num = totalCan.toNumber();
      setCandidatesCount(num);
    }
    catch (error) {
      console.log(error);
    }
  }

  async function getArbiterCount() {
    try {
      const totalArbiters = await votingContract.getArbiterCount();
      const num = totalArbiters.toNumber();
      setArbiterCount(num);
    } catch (error) {
      console.log(error);
    }
  }
  getArbiterCount();
  useEffect(() => {
    connect();
    getCandidates();
  }, []);

  setTimeout(() => {
    getCandidatesCount();
    getArbiterCount();
  }, 500);

  if (candidates.length !== candidatesCount) {
    getCandidates();
  }

  async function getArbiterStatus() {
    if (!ethers.utils.isAddress(arbiterAddress)) {
      setArbiterStatus("Invalid Ethereum Address");
      setTimeout(() => {
        setArbiterStatus("");
      }, 1600);
      return;
    }

    const resultObj = await votingContract.getArbiterStatus(arbiterAddress);
    const result = resultObj.approved;
    setArbiterStatus(result.toString());
    setTimeout(() => {
      setArbiterAddress("");
      setArbiterStatus("");
    }, 1600);
  }

  async function addArbiter() {
    try {
      if (!ethers.utils.isAddress(arbiterApprovalAddress)) {
        setReasonRevertApproval("Invalid Ethereum Address");
        setTimeout(() => {
          setReasonRevertApproval("");
        }, 1600);
        return;
      }

      let add = await votingContract.addAndApproveArbiter(arbiterApprovalAddress);
      await add.wait();
      console.log(add);

      votingContract.on("ArbiterAdded", () => {
        getArbiterCount();
      })
    }
    catch (error) {
      setTimeout(() => {
        if (error.message.includes("reverted with reason string 'You're not an Arbiter'")) {
          setReasonRevertApproval("Already Voted");
        } else if (error.message.includes("reverted with reason string 'Already Voted'")) {
          setReasonRevertApproval("Already Voted");
        } else {
          console.log("Approve Arbiter Error:", error);
        }
      }, 1600);

    }
  }

  async function deleteArbiter() {
    try {
      if (!ethers.utils.isAddress(arbiterDelete)) {
        setReasonRevertDelete("Invalid Ethereum Address");
        setTimeout(() => {
          setReasonRevertDelete("");
        }, 1600);
        return;
      }

      let deleted = await votingContract.deleteArbiter(arbiterDelete);
      await deleted.wait();
      setArbiterAddress("");
      setArbiterStatus("");
      console.log(deleted);
    } catch (error) {
      setTimeout(() => {
        if (error.message.includes("reverted with reason string 'That's not an Arbiter'")) {
          setReasonRevertDelete("Address not an arbiter");
        } else if (error.message.includes("reverted with reason string 'You're not an Arbiter'")) {
          setReasonRevertDelete("You're not an arbiter")
        } else {
          console.log("Delete Arbiter Error:", error);
        }
      }, 1600);
    }
  }

  async function addCandidateProposal() {
    try {

      if (!ethers.utils.isAddress(candidateAddress)) {
        setReasonRevertCanAdd("Invalid Ethereum Address");
        setTimeout(() => {
          setReasonRevertCanAdd("");
        }, 1600);
        return;
      }

      if (candidateName === "" && candidateSymbol === "") {
        setReasonRevertCanAdd("Empty Inputs");
        setTimeout(() => {
          setReasonRevertCanAdd("");
        }, 1600);
        return;
      }

      if (candidateName === "") {
        setReasonRevertCanAdd("Empty Input");
        setTimeout(() => {
          setReasonRevertCanAdd("");
        }, 1600);
        return;
      }

      if (candidateSymbol === "") {
        setReasonRevertCanAdd("Empty Input Symbol");
        setTimeout(() => {
          setReasonRevertCanAdd("");
        }, 1600);
        return;
      }

      const add = await votingContract.addCandidateProposal(candidateAddress, candidateName, candidateSymbol);
      await add.wait();
      console.log(add);

      votingContract.on("CandidateAdded", () => {
        getCandidates();
      })
    }
    catch (error) {
      setTimeout(() => {
        if (error.message.includes("reverted with reason string 'Already Voted'")) {
          setReasonRevertCanAdd("Already Voted");
        } else if (error.message.includes("reverted with reason string 'You're not an Arbiter'")) {
          setReasonRevertCanAdd("You're not an  Arbiter");
        } else {
          console.log("Candidate Add Error:", error);
        }
      }, 1600)
    }
  }

  async function getCandidates() {
    let c = [];
    for (let i = 0; i < candidatesCount; i++) {
      let candidate = await votingContract.getCandidate(i);
      c.push(candidate);
    }
    setCandidates(c);
  }

  if (candidates.length !== candidatesCount) {
    getCandidates();
  }


  return (
    <div className="App">
      <div className="box arbiter-box">
        <p style={{ "font-size": "25px", "textAlign": "center" }} >Arbiter</p>
        <p>Arbiter Count : {arbiterCount}</p>
        <br />
        <label htmlFor='arbiter?'>Arbiter </label>
        <input id='arbiter?' value={arbiterAddress}
          onChange={(event) => {
            setArbiterAddress(event.target.value)
          }} />
        <br />
        <button className="button" id='isArbiter' onClick={getArbiterStatus}>Check</button>
        <p>Status : {arbiterStatus}</p>
        <br />

        <br />

        <label htmlFor="addArbiter">Enter arbiter for adding :</label>
        <input id='addArbiter' value={arbiterApprovalAddress}
          onChange={(event) => {
            setArbiterApprovalAddress(event.target.value)
          }} />
        <br />
        <button className="button" id="addArbiterButton" onClick={addArbiter}>Add</button>

        <br />

        <p>{reasonRevertApproval}</p>


        <label htmlFor="deleteArbiter">Enter arbiter for delete :</label>
        <input id='deleteArbiter' value={arbiterDelete}
          onChange={(event) => {
            setArbiterDelete(event.target.value);
          }} />
        <br />
        <button className="button" id="deleteArbiterButton" onClick={deleteArbiter}>Approve</button>

        <br />

        <p>{reasonRevertDelete}</p>
      </div>

      <div className="box candidate-box">
        <p style={{ "font-size": "25px", "textAlign": "center" }}>Candidate</p>
        <p>No. of candidates : {candidatesCount}</p>
        <div className="box">
          <label htmlFor="candidateAddress">Enter candidate Address :</label>
          <input id='candidateAddress' value={candidateAddress}
            onChange={(event) => {
              setCandidateAddress(event.target.value);
            }} />
          <br />
          <label htmlFor="candidateName">Enter candidate Name :</label>
          <input id='candidateName' value={candidateName}
            onChange={(event) => {
              setCandidateName(event.target.value);
            }} />
          <br />
          <label htmlFor="candidateSymbol">Enter candidate Symbol :</label>
          <input id='candidateSymbol' value={candidateSymbol}
            onChange={(event) => {
              setCandidateSymbol(event.target.value);
            }} />

          <br />
          <button className="button" id="candidateAddButton" onClick={addCandidateProposal}>Add Candidate Proposal</button>
          <br />
          {reasonRevertCanAdd}
        </div>

        {candidates.map((candidate, index) => {
          return <Candidate candidate={candidate} key={index} index={index} contract={votingContract} candidatesCountFunction={getCandidatesCount} />;

        })}
      </div>
      {arbiterCount}
    </div >
  );
}

export default App;