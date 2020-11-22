import * as def from '../config/setup';
import * as op from '../config/functions';
import * as inventory from './inv-setup';
import * as invfunc from './func';
import obc from '../config/setup';

obc.on(
  { name: 'inventory', aliases: ['inv'] },
  (a) => ({ target: a.guildMemberOptional() }),
  async (message, { target }) => {
    target = target || message.member;
    const userLocks = await inventory.getLocks(target.user.id);
    const userMines = await inventory.getMines(target.user.id);
    const userHearts = await inventory.getLives(target.user.id);
    const userPicks = await inventory.getPicks(target.user.id);
    const userGems = await inventory.getGems(target.user.id);
    const embed = new discord.Embed();
    embed
      .setColor(def.standards.embeds.general)
      .setAuthor({ name: `${target.user.username}'s inventory` })
      .setDescription(
        [
          `${
            userLocks === 0 &&
            userMines === 0 &&
            userHearts === 0 &&
            userPicks === 0 &&
            userGems === 0
              ? '**no items to see here. \nuse `.shop` to see what you can buy!**'
              : userLocks === 0
              ? ''
              : `**${def.standards.shopIcons.lock} Padlock: \`${userLocks}\`\nType: \`${inventory.ItemTypes.Tool}\`**`
          }`,
          ``,
          `${
            userMines === 0
              ? ''
              : `**${def.standards.shopIcons.mine} Landmine: \`${userMines}\`\nType: \`${inventory.ItemTypes.Tool}\`**`
          }`,
          ``,
          `${
            userHearts === 0
              ? ''
              : `**${def.standards.shopIcons.life} Backup Heart: \`${userHearts}\`\nType: \`${inventory.ItemTypes.PowerUp}\`**`
          }`,
          `${
            userPicks === 0
              ? userGems === 0
                ? ''
                : `\n**${def.standards.shopIcons.gem} Gems: \`${userGems}\`\nType: \`${inventory.ItemTypes.Collectible}\`**`
              : `\n**${def.standards.shopIcons.pick} Pickaxe: \`${userPicks}\`\nType: \`${inventory.ItemTypes.Tool}\`**\n\n**${def.standards.shopIcons.gem} Gems: \`${userGems}\`\nType: \`${inventory.ItemTypes.Collectible}\`**`
          }`
        ].join('\n')
      );
    await message.reply(embed);
  }
);

const nonBuyableItems = [`${inventory.Item.gemID}`];

obc.on(
  {
    name: 'buy',
    aliases: ['b', 'purchase']
  },
  (a) => ({ shopItem: a.string(), count: a.integerOptional() }),
  async (message, { shopItem, count }) => {
    count = count || 1;
    if (nonBuyableItems.includes(shopItem.toLowerCase())) {
      return message.reply(`This item cannot be Purchased.`);
    }
    const item = inventory.findItemByName(shopItem);
    if (item == null) {
      return message.reply({
        content: `Item with name: **${shopItem}** does not exist, use \`.shop\` to list items that can be purchased.`,
        allowedMentions: {}
      });
    }
    await inventory.buyItem(message.author.id, shopItem, message, count);
  }
);

obc.on(
  {
    name: 'sell',
    aliases: ['s']
  },
  (a) => ({ shopItem: a.string(), count: a.integerOptional() }),
  async (message, { shopItem, count }) => {
    count = count || 1;
    const item = inventory.findItemByName(shopItem);
    if (item == null) {
      return message.reply({
        content: `Item with name: **${shopItem}** does not exist, use \`.shop\` to list items that can be sold.`,
        allowedMentions: {}
      });
    }
    await inventory.sellItem(message.author.id, shopItem, message, count);
  }
);

obc.on(
  {
    name: 'use',
    aliases: ['equip', 'open']
  },
  (a) => ({ inventoryItem: a.text() }),
  async (message, { inventoryItem }) => {
    const lastUse = await def.tempStorageKV.get<number>(
      `lastUse-${message.author?.id}`
    );
    if (lastUse)
      return message.reply(`You need to wait before using an Item again.`);
    await def.tempStorageKV.put(`lastUse-${message.author?.id}`, Date.now(), {
      ttl: def.standards.TIMERS.BET_INTERVAL
    });
    const item = inventory.findItemByName(inventoryItem);
    if (item == null) {
      return message.reply({
        content: `Item with name: **${inventoryItem}** is not in your inventory, use \`.inventory\` to list items that you have.`,
        allowedMentions: {}
      });
    }
    await inventory.useItem(message.author.id, inventoryItem, message);
  }
);
