import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

const { ethers } = await network.create();

const PowerStatus = {
  Off: 0,
  On: 1,
} as const;

async function expectRevert(action: Promise<unknown>, message: string) {
  try {
    await action;
  } catch (error) {
    assert.match((error as Error).message, new RegExp(message));
    return;
  }

  throw new Error(`Expected transaction to revert with: ${message}`);
}

async function eventNames(
  contract: { interface: { parseLog: (log: unknown) => { name: string } | null } },
  tx: Promise<{ wait: () => Promise<{ logs: unknown[] } | null> }>,
) {
  const receipt = await (await tx).wait();

  return (
    receipt?.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log)?.name;
        } catch {
          return null;
        }
      })
      .filter(Boolean) ?? []
  );
}

describe("GridWitness", function () {
  async function deployFixture() {
    const [admin, meterA, meterB, meterC, ikejaMeter] = await ethers.getSigners();
    const gridWitness = await ethers.deployContract("GridWitness", [], admin);

    await gridWitness.registerMeter("GW-YB-001", meterA.address, "Yaba");
    await gridWitness.registerMeter("GW-YB-002", meterB.address, "Yaba");
    await gridWitness.registerMeter("GW-YB-003", meterC.address, "Yaba");
    await gridWitness.registerMeter("GW-IK-001", ikejaMeter.address, "Ikeja GRA");

    return { admin, meterA, meterB, meterC, ikejaMeter, gridWitness };
  }

  it("registers a smart meter with owner and location", async function () {
    const [admin, newOwner] = await ethers.getSigners();
    const gridWitness = await ethers.deployContract("GridWitness", [], admin);

    const events = await eventNames(
      gridWitness,
      gridWitness.registerMeter("GW-YB-010", newOwner.address, "Yaba"),
    );
    const stored = await gridWitness.getMeter("GW-YB-010");

    assert.ok(events.includes("MeterRegistered"));
    assert.equal(stored.owner, newOwner.address);
    assert.equal(stored.location, "Yaba");
    assert.equal(stored.registered, true);
    assert.equal(stored.rewardPoints, 0n);
  });

  it("prevents unauthorized and duplicate meter registration", async function () {
    const { meterA, meterB, gridWitness } = await deployFixture();

    await expectRevert(
      gridWitness.connect(meterA).registerMeter("GW-YB-010", meterA.address, "Yaba"),
      "Only owner",
    );

    await expectRevert(
      gridWitness.registerMeter("GW-YB-001", meterB.address, "Yaba"),
      "Meter already registered",
    );
  });

  it("allows each registered meter to report once per round", async function () {
    const { meterA, gridWitness } = await deployFixture();

    const events = await eventNames(
      gridWitness,
      gridWitness.connect(meterA).submitReport(1, "GW-YB-001", PowerStatus.Off),
    );

    assert.ok(events.includes("ReportSubmitted"));
    assert.equal(await gridWitness.hasSubmitted(1, "GW-YB-001"), true);
    await expectRevert(
      gridWitness.connect(meterA).submitReport(1, "GW-YB-001", PowerStatus.On),
      "Duplicate report",
    );
  });

  it("rejects unregistered meters, wrong owners, and mixed-location rounds", async function () {
    const { meterA, meterB, ikejaMeter, gridWitness } = await deployFixture();

    await expectRevert(
      gridWitness.connect(meterA).submitReport(1, "GW-UNKNOWN", PowerStatus.Off),
      "Meter not registered",
    );

    await expectRevert(
      gridWitness.connect(meterB).submitReport(1, "GW-YB-001", PowerStatus.Off),
      "Not meter owner",
    );

    await gridWitness.connect(meterA).submitReport(2, "GW-YB-001", PowerStatus.Off);
    await expectRevert(
      gridWitness.connect(ikejaMeter).submitReport(2, "GW-IK-001", PowerStatus.Off),
      "Wrong location for round",
    );
  });

  it("verifies an outage with 67% power-off consensus and rewards accurate meters", async function () {
    const { meterA, meterB, meterC, gridWitness } = await deployFixture();

    await gridWitness.connect(meterA).submitReport(10, "GW-YB-001", PowerStatus.Off);
    await gridWitness.connect(meterB).submitReport(10, "GW-YB-002", PowerStatus.Off);
    await gridWitness.connect(meterC).submitReport(10, "GW-YB-003", PowerStatus.On);
    const finalize = await gridWitness.finalizeRound(10);
    const receipt = await finalize.wait();

    const round = await gridWitness.getRound(10);
    const outage = await gridWitness.getVerifiedOutage(1);
    const participants = await gridWitness.getOutageParticipantMeters(1);
    const meterAState = await gridWitness.getMeter("GW-YB-001");
    const meterBState = await gridWitness.getMeter("GW-YB-002");
    const meterCState = await gridWitness.getMeter("GW-YB-003");

    assert.equal(round.reportCount, 3n);
    assert.equal(round.powerOffCount, 2n);
    assert.equal(round.powerOnCount, 1n);
    assert.equal(round.consensusPercentage, 67n);
    assert.equal(round.majorityStatus, BigInt(PowerStatus.Off));
    assert.equal(round.outageVerified, true);
    assert.equal(outage.location, "Yaba");
    assert.equal(outage.consensusPercentage, 67n);
    assert.deepEqual(Array.from(participants), ["GW-YB-001", "GW-YB-002", "GW-YB-003"]);
    assert.equal(meterAState.rewardPoints, 25n);
    assert.equal(meterBState.rewardPoints, 25n);
    assert.equal(meterCState.rewardPoints, 0n);

    const parsedLogs = receipt?.logs
      .map((log) => {
        try {
          return gridWitness.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const emitted = parsedLogs?.map((log) => log?.name);
    assert.ok(emitted?.includes("ConsensusReached"));
    assert.ok(emitted?.includes("OutageVerified"));
    assert.ok(emitted?.includes("RewardIssued"));

    await expectRevert(gridWitness.finalizeRound(10), "Round already finalized");

    const meterAAfterReplay = await gridWitness.getMeter("GW-YB-001");
    assert.equal(meterAAfterReplay.rewardPoints, 25n);
  });

  it("rejects finalizing empty rounds so rounds never get stuck silently", async function () {
    const { gridWitness } = await deployFixture();

    await expectRevert(gridWitness.finalizeRound(99), "No reports");
  });

  it("finalizes a power-on majority without verifying an outage", async function () {
    const { meterA, meterB, meterC, gridWitness } = await deployFixture();

    await gridWitness.connect(meterA).submitReport(11, "GW-YB-001", PowerStatus.On);
    await gridWitness.connect(meterB).submitReport(11, "GW-YB-002", PowerStatus.On);
    await gridWitness.connect(meterC).submitReport(11, "GW-YB-003", PowerStatus.Off);
    await gridWitness.finalizeRound(11);

    const round = await gridWitness.getRound(11);
    const meterAState = await gridWitness.getMeter("GW-YB-001");
    const meterCState = await gridWitness.getMeter("GW-YB-003");

    assert.equal(round.majorityStatus, BigInt(PowerStatus.On));
    assert.equal(round.outageVerified, false);
    assert.equal(await gridWitness.outageCount(), 0n);
    assert.equal(meterAState.rewardPoints, 25n);
    assert.equal(meterCState.rewardPoints, 0n);
  });
});
