import { Router, Request, Response } from "express";
import { ReputationCacheService } from "../services/reputation-cache.service";

const router = Router();

/**
 * GET /api/v1/reputation/:walletAddress
 * Returns the on-chain reputation score and endorsement weight for a wallet.
 * Used by the public profile ReputationPanel component.
 */
router.get("/:walletAddress", async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const reputation = await ReputationCacheService.getCachedReputation(walletAddress);
  if (!reputation) {
    return res.status(404).json({ error: "Reputation data not found for this wallet." });
  }
  return res.json({
    score: reputation.score,
    stake: reputation.endorsementWeight,
    tier: reputation.tier,
    disputeLossRate: reputation.disputeLossRate,
  });
});

export default router;
