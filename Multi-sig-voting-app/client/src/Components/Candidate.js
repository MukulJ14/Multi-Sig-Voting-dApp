import { useState } from "react";
import "../App.css"
export default function Candidate(props) {
    const [reasonRevertApproval, setReasonRevertApproval] = useState("");
    const [reasonRevertVote, setReasonRevertVote] = useState("");

    async function approveCandidate() {
        try {
            let approval = await props.contract.approveCandidate(props.index);
            await approval.wait();
            console.log(approval);

            props.contract.on("CandidateAdded", () => {
                props.candidatesCountFunction();
            })

        } catch (error) {
            setTimeout(() => {
                if (error.message.includes("reverted with reason string 'You're not an Arbiter'")) {
                    setReasonRevertApproval("You're not an arbiter");
                } else if (error.message.includes("reverted with reason string 'Already Voted'")) {
                    setReasonRevertApproval("Already Voted");
                }
                console.log(error);
            }, 1600);
        }
    }

    async function vote() {
        try {
            let vote = await props.contract.vote(props.index);
            await vote.wait();
            console.log(vote);
        } catch (error) {
            setTimeout(() => {
                if (error.message.includes("reverted with reason string 'You've voted'")) {
                    setReasonRevertVote("Already Voted")
                } else {
                    console.log(error);
                }
            }, 1600);
        }
    }
    return (
        <div className="box candidate-box">
            <p>Candidate {props.index + 1}</p>
            <p>Candidate name : {props.candidate.name}</p>
            <p>Candidate symbol : {props.candidate.symbol}</p>
            {props.candidate.approved ?
                <button id={`vote${props.index}`} onClick={vote} >Vote</button> :
                <button id={`approve${props.index}`} onClick={approveCandidate}>Approve</button>
            }
            <p>{reasonRevertApproval}</p>
            <p>{reasonRevertVote}</p>
        </div>
    )
}