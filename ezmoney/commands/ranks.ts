import { standards as config } from '../config/setup';
import * as steal from '../steal/steal-func';

const robRanks = (rank: number) => {
  switch (true) {
    default:
      return `_ _`;
    case rank > 4 && rank < 10:
      return `${config.ranks.s1.slice(0, -9)}`;
      break;
    case rank < 20 && rank > 9:
      return `${config.ranks.s2.slice(0, -10)}`;
    case rank < 22 && rank > 19:
      return `${config.ranks.s3.slice(0, -10)}`;
  }
};

export async function getUserRank(userId: discord.Snowflake) {
  const userRobWins = await steal.getRobWins(userId);
  const currentRank = robRanks(userRobWins);
  if (currentRank) return `${currentRank}`;
}
