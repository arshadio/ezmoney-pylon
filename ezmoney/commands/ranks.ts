import { standards as config } from '../config/setup';
import * as steal from '../steal/steal-func';
import * as def from '../config/functions';

const deathRanks: Map<string, number> = new Map();

const robRanks = (rank: number) => {
  switch (true) {
    default:
      return `_ _`;
    case rank > 4 && rank < 10:
      return `${config.ranks.s1}`;
      break;
    case rank < 20 && rank > 9:
      return `${config.ranks.s2}`;
    case rank < 22 && rank > 19:
      return `${config.ranks.s3}`;
  }
};

const gambleRanks = (amountWon: number) => {
  switch (true) {
    default:
      return `_ _`;
    case amountWon > 50000:
      return `${config.ranks.gambler}`;
  }
};

export async function getRobRank(userId: discord.Snowflake) {
  const userRobWins = await steal.getRobWins(userId);
  const currentRank = robRanks(userRobWins);
  if (currentRank) return `${currentRank}`;
}

export async function getGambleRank(userId: discord.Snowflake) {
  const userGambleRewards = await def.getGained(userId);
  const currentRank = gambleRanks(userGambleRewards);
  if (currentRank) return `${currentRank}`;
}
