import * as def from '../config/setup';
import * as op from '../config/functions';
import * as steal from '../steal/steal-func';
import * as inventory from '../inventory/inv-setup';
import { getUserRank } from '../steal/stealRanks';
import obc from '../config/setup';

obc.subcommand({ name: 'profile' }, async (profileC) => {
  profileC.default(
    (args) => ({ target: args.guildMemberOptional() }),
    async (message, { target }) => {
      const finalLvlToGetMulti = 50;
      target = target || message.member;
      const multi = await op.getMulti(target.user.id);
      const bal = await op.getBalance(target.user.id);
      const xp = await op.getXp(target.user.id);
      const level = def.levelScale * Math.sqrt(xp);
      const nextLevel = Math.floor(level) + 1;
      const prevLvl = Math.floor(level) - 1;
      const xpForLevel = Math.floor((nextLevel / def.levelScale) ** 2);
      const previousLevel = Math.floor((prevLvl * 0.15) / 2 / 2) ** 100;
      const userLevel = Math.floor(def.levelScale * Math.sqrt(xp ?? 0));
      // inventory
      const locks = await inventory.getLocks(target.user.id);
      const mines = await inventory.getMines(target.user.id);
      const lives = await inventory.getLives(target.user.id);
      const picks = await inventory.getPicks(target.user.id);
      const gems = await inventory.getGems(target.user.id);
      const equippedLock = await inventory.getLockEquipped(target.user.id);
      const equippedMines = await inventory.getMineEquipped(target.user.id);
      const mineUses = await inventory.getMineUses(target.user.id);
      const totalInInv = locks + mines + lives + picks + gems;
      const valueOfInv =
        inventory.Item.padlockPrice * locks +
        inventory.Item.landminePrice * mines +
        inventory.Item.lifesaverPrice * lives +
        inventory.Item.pickaxePrice * picks +
        inventory.ItemConfig.gemPrice * gems;
      const embed = new discord.Embed();
      embed
        .setColor(def.standards.embeds.general)
        .setAuthor({
          name: `${target.user.username}'s profile`,
          iconUrl: target.user.getAvatarUrl()
        })
        .setDescription(`${await getUserRank(target.user.id)}`)
        .addField({
          name: 'Level',
          value: `**${userLevel}**\n${new Array(10)
            .fill(0)
            .map((el, i) =>
              i < (userLevel / finalLvlToGetMulti) * 10 ? '■' : '□'
            )
            .join('')}`,
          inline: true
        })
        .addField({
          name: 'Experience',
          value: `**${xp}/${xpForLevel}**\n${new Array(10)
            .fill(0)
            .map((el, i) =>
              i <
              Math.floor(
                (xp - previousLevel) / ((xpForLevel - previousLevel) / 100) / 10
              )
                ? '■'
                : '□'
            )
            .join('')}`,
          inline: true
        })
        .addField({
          name: 'Balance',
          value: `**${def.standards.currency}${bal}\n${multi}%** multiplier`,
          inline: true
        })
        .addField({
          name: 'Inventory',
          value: `**\`${totalInInv}\`** item${
            totalInInv === 1 ? '' : 's'
          } worth **${def.standards.currency}${valueOfInv}**`,
          inline: true
        })
        .addField({
          name: `Equipped Items`,
          value: [
            `${
              equippedLock === 1
                ? `**${def.standards.shopIcons.lock} Padlock**`
                : equippedLock === 0 && equippedMines === 0
                ? '**No Items are equipped.**'
                : ''
            }`,
            `${
              equippedMines === 1
                ? `**${
                    def.standards.shopIcons.mine
                  } Landmine** - **\`${inventory.ItemConfig.mineUses -
                    mineUses}\`** use${
                    inventory.ItemConfig.mineUses - mineUses === 1 ? '' : 's'
                  } remaining`
                : ''
            }`
          ].join('\n')
        })
        .setFooter({ text: '.profile --help for more stats' });
      await message.reply(embed);
    }
  );
  profileC.raw({ name: '--help', aliases: ['--h'] }, async (message) => {
    await message.reply(`**Add flags to the command to see more advanced stats
    Flags**: \`--gamble\`, \`--rob\`, \`--share\`
    **Usage**: \`.profile --rob <@userOptional>\``);
  });
  profileC.on(
    { name: '--gamble', aliases: ['--g'] },
    (a) => ({ target: a.guildMemberOptional() }),
    async (message, { target }) => {
      target = target || message.member;
      const gw = await op.getGambleWins(target.user.id);
      const gl = await op.getGambleLosses(target.user.id);
      const combined = gw + gl;
      const totalWon = await op.getGained(target.user.id);
      const totalLost = await op.getLost(target.user.id);
      let symbol =
        totalLost > totalWon
          ? discord.decor.Emojis.CHART_WITH_DOWNWARDS_TREND
          : totalLost === totalWon
          ? discord.decor.Emojis.STOP_BUTTON
          : discord.decor.Emojis.CHART_WITH_UPWARDS_TREND;
      const embed = new discord.Embed();
      embed
        .setColor(def.standards.embeds.general)
        .setAuthor({ name: `${target.user.username}'s gambling stats` })
        .setDescription(
          `${symbol} stats from the last \`${combined}\` games
        ➜ includes **[coinflip, gamble, slots]**`
        )
        .addField({
          name: `Amount Won`,
          value: `**${def.standards.currency}${totalWon}**`
        })
        .addField({
          name: `Amount Lost`,
          value: `**${def.standards.currency}${totalLost}**`
        })
        .addField({
          name: `Winrate`,
          value: `**${
            combined === 0 ? '0%' : `${Math.round((gw / combined) * 100)}%`
          }**`
        });
      await message.reply(embed);
    }
  );
  profileC.on(
    { name: '--rob', aliases: ['--steal', '--s', '--r'] },
    (a) => ({ target: a.guildMemberOptional() }),
    async (message, { target }) => {
      target = target || message.member;
      const rw = await steal.getRobWins(target.user.id);
      const rl = await steal.getRobLosses(target.user.id);
      const combined = rw + rl;
      const totalRobbed = await steal.getAmtRobbed(target.user.id);
      const totalPaid = await steal.getAmtPaid(target.user.id);
      const embed = new discord.Embed();
      embed
        .setColor(def.standards.embeds.general)
        .setAuthor({ name: `${target.user.username}'s stealing stats` })
        .setDescription(
          `${await getUserRank(
            target.user.id
          )} \nstats from the last \`${combined}\` steal attempts`
        )
        .addField({
          name: `Successes`,
          value: `**${rw}**`,
          inline: true
        })
        .addField({
          name: `Fails`,
          value: `**${rl}**`,
          inline: true
        })
        .addField({
          name: `Win%`,
          value: `**${
            combined === 0 ? '0%' : `${Math.round((rw / combined) * 100)}%`
          }**`,
          inline: true
        })
        .addField({
          name: `Amount Stolen`,
          value: `**${def.standards.currency}${totalRobbed}**`,
          inline: true
        })
        .addField({
          name: `Amount Paid (fails)`,
          value: `**${def.standards.currency}${totalPaid}**`,
          inline: true
        });
      await message.reply(embed);
    }
  );
  profileC.on(
    { name: '--share', aliases: ['--sh'] },
    (a) => ({ target: a.guildMemberOptional() }),
    async (message, { target }) => {
      target = target || message.member;
      const amountShared = await op.getAmountShared(target.user.id);
      const amountRecieved = await op.getAmountRecieved(target.user.id);
      const embed = new discord.Embed();
      embed
        .setColor(def.standards.embeds.general)
        .setAuthor({ name: `${target.user.username}'s sharing stats` })
        .addField({
          name: `Amount Shared`,
          value: `**${def.standards.currency}${amountShared}**`
        })
        .addField({
          name: `Amount Recieved`,
          value: `**${def.standards.currency}${amountRecieved}**`
        });
      await message.reply(embed);
    }
  );
});
