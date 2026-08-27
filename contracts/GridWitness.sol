// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title GridWitness
/// @notice Hackathon-ready outage consensus demo for registered smart meters.
contract GridWitness {
    enum PowerStatus {
        Off,
        On
    }

    struct Meter {
        address owner;
        string location;
        bool registered;
        uint256 rewardPoints;
        uint256 totalReports;
    }

    struct Report {
        string meterId;
        address reporter;
        string location;
        PowerStatus status;
        uint256 timestamp;
    }

    struct RoundSummary {
        uint256 id;
        string location;
        uint256 reportCount;
        uint256 powerOffCount;
        uint256 powerOnCount;
        uint256 consensusPercentage;
        PowerStatus majorityStatus;
        bool finalized;
        bool outageVerified;
    }

    struct VerifiedOutage {
        uint256 id;
        uint256 roundId;
        string location;
        uint256 startTime;
        uint256 consensusPercentage;
        string[] participatingMeters;
    }

    uint256 public constant REWARD_PER_ACCURATE_REPORT = 25;

    address public owner;
    uint256 public outageCount;

    mapping(string meterId => Meter) private meters;
    mapping(uint256 roundId => RoundSummary) private rounds;
    mapping(uint256 roundId => string[]) private roundParticipants;
    mapping(uint256 roundId => mapping(string meterId => bool)) private hasReportedInRound;
    mapping(uint256 roundId => mapping(string meterId => Report)) private roundReports;
    mapping(uint256 outageId => VerifiedOutage) private verifiedOutages;

    event MeterRegistered(string indexed meterId, address indexed owner, string location);
    event ReportSubmitted(
        uint256 indexed roundId,
        string indexed meterId,
        address indexed reporter,
        string location,
        PowerStatus status
    );
    event ConsensusReached(
        uint256 indexed roundId,
        string location,
        PowerStatus majorityStatus,
        uint256 consensusPercentage,
        uint256 reportCount
    );
    event OutageVerified(
        uint256 indexed outageId,
        uint256 indexed roundId,
        string location,
        uint256 startTime,
        uint256 consensusPercentage
    );
    event RewardIssued(string indexed meterId, address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerMeter(
        string calldata meterId,
        address meterOwner,
        string calldata location
    ) external onlyOwner {
        require(bytes(meterId).length > 0, "Meter id required");
        require(meterOwner != address(0), "Owner required");
        require(bytes(location).length > 0, "Location required");
        require(!meters[meterId].registered, "Meter already registered");

        meters[meterId] = Meter({
            owner: meterOwner,
            location: location,
            registered: true,
            rewardPoints: 0,
            totalReports: 0
        });

        emit MeterRegistered(meterId, meterOwner, location);
    }

    function submitReport(uint256 roundId, string calldata meterId, PowerStatus status) external {
        Meter storage meter = meters[meterId];
        require(meter.registered, "Meter not registered");
        require(msg.sender == meter.owner, "Not meter owner");
        require(!rounds[roundId].finalized, "Round finalized");
        require(!hasReportedInRound[roundId][meterId], "Duplicate report");

        RoundSummary storage round = rounds[roundId];
        if (round.reportCount == 0) {
            round.id = roundId;
            round.location = meter.location;
        } else {
            require(
                keccak256(bytes(round.location)) == keccak256(bytes(meter.location)),
                "Wrong location for round"
            );
        }

        hasReportedInRound[roundId][meterId] = true;
        roundParticipants[roundId].push(meterId);
        round.reportCount += 1;
        meter.totalReports += 1;

        if (status == PowerStatus.Off) {
            round.powerOffCount += 1;
        } else {
            round.powerOnCount += 1;
        }

        roundReports[roundId][meterId] = Report({
            meterId: meterId,
            reporter: msg.sender,
            location: meter.location,
            status: status,
            timestamp: block.timestamp
        });

        emit ReportSubmitted(roundId, meterId, msg.sender, meter.location, status);
    }

    function finalizeRound(uint256 roundId) external {
        RoundSummary storage round = rounds[roundId];
        require(round.reportCount > 0, "No reports");
        require(!round.finalized, "Round already finalized");

        bool powerOffMajority = round.powerOffCount > round.powerOnCount;
        uint256 majorityCount = powerOffMajority ? round.powerOffCount : round.powerOnCount;
        round.majorityStatus = powerOffMajority ? PowerStatus.Off : PowerStatus.On;
        round.consensusPercentage =
            ((majorityCount * 100) + (round.reportCount / 2)) /
            round.reportCount;
        round.outageVerified = round.powerOffCount * 100 > round.reportCount * 50;
        round.finalized = true;

        emit ConsensusReached(
            roundId,
            round.location,
            round.majorityStatus,
            round.consensusPercentage,
            round.reportCount
        );

        string[] storage participants = roundParticipants[roundId];
        for (uint256 i = 0; i < participants.length; i++) {
            string storage participantId = participants[i];
            Report storage report = roundReports[roundId][participantId];
            if (report.status == round.majorityStatus) {
                meters[participantId].rewardPoints += REWARD_PER_ACCURATE_REPORT;
                emit RewardIssued(
                    participantId,
                    meters[participantId].owner,
                    REWARD_PER_ACCURATE_REPORT
                );
            }
        }

        if (round.outageVerified) {
            outageCount += 1;
            string[] storage outageParticipants = verifiedOutages[outageCount].participatingMeters;
            for (uint256 i = 0; i < participants.length; i++) {
                outageParticipants.push(participants[i]);
            }

            VerifiedOutage storage outage = verifiedOutages[outageCount];
            outage.id = outageCount;
            outage.roundId = roundId;
            outage.location = round.location;
            outage.startTime = block.timestamp;
            outage.consensusPercentage = round.consensusPercentage;

            emit OutageVerified(
                outageCount,
                roundId,
                round.location,
                block.timestamp,
                round.consensusPercentage
            );
        }
    }

    function getMeter(string calldata meterId) external view returns (Meter memory) {
        return meters[meterId];
    }

    function getRound(uint256 roundId) external view returns (RoundSummary memory) {
        return rounds[roundId];
    }

    function getRoundParticipantMeters(uint256 roundId) external view returns (string[] memory) {
        return roundParticipants[roundId];
    }

    function getReport(
        uint256 roundId,
        string calldata meterId
    ) external view returns (Report memory) {
        return roundReports[roundId][meterId];
    }

    function hasSubmitted(uint256 roundId, string calldata meterId) external view returns (bool) {
        return hasReportedInRound[roundId][meterId];
    }

    function getVerifiedOutage(uint256 outageId) external view returns (VerifiedOutage memory) {
        return verifiedOutages[outageId];
    }

    function getOutageParticipantMeters(uint256 outageId) external view returns (string[] memory) {
        return verifiedOutages[outageId].participatingMeters;
    }
}
