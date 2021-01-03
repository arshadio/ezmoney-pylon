import * as def from '../config/setup';
import * as op from '../config/functions';
import * as inventory from './inv-setup';
import * as invfunc from './func';
import { getObjectProperty as find } from './shop';
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
    const userCommons = await inventory.getCommonCrates(target.user.id);
    const mapItems: Map<string, number> = new Map([
      [`**${def.standards.shopIcons.lock} Padlock:** `, userLocks],
      [`**${def.standards.shopIcons.mine} Landmine:** `, userMines],
      [`**${def.standards.shopIcons.life} Backup Heart:** `, userHearts],
      [`**${def.standards.shopIcons.pick} Pickaxe:** `, userPicks],
      [`**${def.standards.shopIcons.gem} Gems:** `, userGems],
      [`**${def.standards.shopIcons.commonCrate} Common Crate:** `, userCommons]
    ]);
    const inventoryWithItems = [];
    for (const [name, value] of mapItems.entries()) {
      if (value > 0) {
        inventoryWithItems.push([name + `**\`${value}\`**`], '');
      }
    }
    const embed = new discord.Embed();
    embed
      .setColor(def.standards.embeds.general)
      .setAuthor({ name: `${target.user.username}'s inventory` })
      .setDescription(
        inventoryWithItems === undefined || inventoryWithItems.length == 0
          ? '**nothing to see here...**'
          : inventoryWithItems.join('\n')
      )
      .setFooter({
        text: "For more information on \nan item, use '.shop <id>'"
      });
    await message.reply(embed);
  }
);

const nonBuyableItems = inventory.nonShopItems;

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
    await inventory.purchaseItem(message.author.id, shopItem, message, count);
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
    await inventory.SellItem(message.author.id, shopItem, count, message);
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
