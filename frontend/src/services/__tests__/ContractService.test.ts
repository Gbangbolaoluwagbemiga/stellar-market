// Simulated get_reputation results are fed through the SDK mock below.
const mockSimulate = jest.fn();
jest.mock("@stellar/stellar-sdk", () => {
  const builder = {
    addOperation: () => builder,
    setTimeout: () => builder,
    build: () => ({}),
  };
  return {
    Account: jest.fn(),
    Address: { fromString: jest.fn() },
    Contract: jest.fn().mockImplementation(() => ({ call: jest.fn() })),
    Networks: { TESTNET: "testnet" },
    TransactionBuilder: jest.fn().mockImplementation(() => builder),
    nativeToScVal: jest.fn(),
    rpc: {
      Server: jest.fn().mockImplementation(() => ({ simulateTransaction: mockSimulate })),
      Api: { isSimulationError: () => false },
    },
    scValToNative: (v: unknown) => v,
  };
});

type ContractServiceModule = typeof import("@/services/ContractService");

const originalContractId = process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ID;
let ContractService: ContractServiceModule["ContractService"];

beforeAll(async () => {
  // Read at module load, so set before importing.
  process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ID = "CREPUTATION";
  ({ ContractService } = await import("@/services/ContractService"));
});

afterAll(() => {
  if (originalContractId === undefined) {
    delete process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ID;
  } else {
    process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ID = originalContractId;
  }
});

// Shape returned by the reputation contract's get_reputation (u64 fields arrive as bigint).
function onChain(totalScore: bigint, totalWeight: bigint, reviewCount: number) {
  mockSimulate.mockResolvedValue({
    result: {
      retval: { total_score: totalScore, total_weight: totalWeight, review_count: reviewCount },
    },
  });
}

describe("ContractService.getReputation scale", () => {
  it("returns a 4.5-star average as 4.5 on the 1-5 scale", async () => {
    onChain(9n, 2n, 2); // ratings 5 and 4, weight 1 each

    const result = await ContractService.getReputation("GUSER");

    expect(result?.score).toBe(4.5);
    expect(result?.score.toFixed(1)).toBe("4.5");
    expect(result?.reviewCount).toBe(2);
  });

  it("weights the average by stake weight", async () => {
    onChain(17n, 4n, 2); // rating 5 at weight 3, rating 2 at weight 1

    const result = await ContractService.getReputation("GUSER");

    expect(result?.score).toBe(4.25);
  });

  it.each([
    [1n, 1n, "Bronze"], // 1.0 -> 100
    [29n, 10n, "Bronze"], // 2.9 -> 290
    [3n, 1n, "Silver"], // 3.0 -> 300
    [9n, 2n, "Silver"], // 4.5 -> 450
    [5n, 1n, "Gold"], // 5.0 -> 500
  ])(
    "awards the tier for total_score %s / total_weight %s on the hundred scale (%s)",
    async (totalScore, totalWeight, tier) => {
      onChain(totalScore, totalWeight, 1);

      const result = await ContractService.getReputation("GUSER");

      expect(result?.badgeTier).toBe(tier);
    },
  );

  it("compares custom tiers against the hundred-scale average", async () => {
    onChain(5n, 1n, 1);

    const result = await ContractService.getReputation("GUSER", [
      { name: "Gold", minScore: 300, colour: "#FFD700" },
      { name: "Platinum", minScore: 480, colour: "#E5E4E2" },
    ]);

    expect(result?.badgeTier).toBe("Platinum");
  });
});
