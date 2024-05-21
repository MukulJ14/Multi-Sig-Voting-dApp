//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Voting {
    struct Candidate {
        bool approved;
        uint approveCount;
        address candidate;
        string name;
        string symbol;
        uint votes;
    }

    struct Arbiter {
        address arbiterAddress;
        uint approveCount;
        bool approved;
    }

    mapping(address => Arbiter) public isArbiter;
    uint public arbiterCount = 0;

    mapping(uint => Candidate) public candidates;
    uint public candidatesCount = 0;
    mapping(uint => mapping(address => bool)) approverCandidate;
    mapping(address => mapping(address => bool)) approverArbiter;
    mapping(address => uint) public removeArbiter;
    mapping(address => bool) public voted;

    uint time;

    constructor() {
        isArbiter[msg.sender].approved = true;
        arbiterCount++;
        time = block.timestamp;
    }

    event ArbiterAdded(address _address);
    event ArbiterRemoved(address _address);
    event CandidateAdded(string candidateName, string candidateSymbol);
    event Voted(address _address);

    function getArbiterCount() public view returns (uint) {
        return arbiterCount;
    }

    function getCandidateCount() public view returns (uint) {
        return candidatesCount;
    }

    function getArbiterStatus(
        address _address
    ) public view returns (Arbiter memory) {
        return isArbiter[_address];
    }

    function getCandidate(
        uint _candidate
    ) public view returns (Candidate memory) {
        return candidates[_candidate];
    }

    function addAndApproveArbiter(address _address) public votingOn {
        require(isArbiter[msg.sender].approved, "You're not an Arbiter");
        require(!(approverArbiter[msg.sender][_address]), "Already Voted");
        isArbiter[_address].approveCount++;
        approverArbiter[msg.sender][_address] = true;

        if (isArbiter[_address].approveCount > ((arbiterCount * 2) / 3)) {
            isArbiter[_address].approved = true;
            arbiterCount++;
            emit ArbiterAdded(_address);
        }
    }

    function deleteArbiter(address _address) public votingOn {
        require(isArbiter[_address].approved, "That's not an Arbiter");
        require(isArbiter[msg.sender].approved, "You're not an Arbiter");
        removeArbiter[_address]++;
        approverArbiter[msg.sender][_address] = false;
        if (
            removeArbiter[_address] > ((arbiterCount * 2) / 3) ||
            arbiterCount == 2
        ) {
            isArbiter[_address].approved = false;
            isArbiter[_address].approveCount = 0;
            arbiterCount--;
            removeArbiter[_address] = 0;
            emit ArbiterRemoved(_address);
        }
    }

    function addCandidateProposal(
        address _address,
        string calldata _name,
        string calldata _symbol
    ) public votingOn {
        //Can an arbiter be a candidate or a voter
        require(isArbiter[msg.sender].approved, "You're not an Arbiter");
        //require(isArbiter[msg.sender].approveCount == 0, "Should not be an arbiter");
        require(
            !approverCandidate[candidatesCount][msg.sender],
            "Already Voted"
        );
        approverCandidate[candidatesCount][msg.sender] = true;
        candidates[candidatesCount] = Candidate(
            false,
            1,
            _address,
            _name,
            _symbol,
            0
        );

        if (arbiterCount == 1) {
            candidates[candidatesCount].approved = true;
            emit CandidateAdded(_name, _symbol);
        }
        candidatesCount++;
    }

    function approveCandidate(uint _id) public votingOn {
        require(isArbiter[msg.sender].approved, "not an Arbiter");
        require(!approverCandidate[_id][msg.sender], "Already Voted");
        approverCandidate[_id][msg.sender] = true;
        candidates[_id].approveCount++;

        if (candidates[_id].approveCount > ((arbiterCount * 2) / 3)) {
            candidates[_id].approved = true;
            emit CandidateAdded(candidates[_id].name, candidates[_id].symbol);
        }
    }

    function vote(uint _id) public votingOn {
        require(candidates[_id].approved, "not approved");
        require(!voted[msg.sender], "You've voted");
        candidates[_id].votes++;
        voted[msg.sender] = true;

        emit Voted(candidates[_id].candidate);
    }

    modifier votingOn() {
        require(time <= block.timestamp + 2 minutes, "Voting ended");
        _;
    }
}
