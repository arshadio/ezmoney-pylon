import * as def from '../config/setup';
import * as op from '../config/functions';
import * as intoInventory from './func';
import obc from '../config/setup';

// functions to access the items in your inventory.
export async function getLocks(userId: discord.Snowflake): Promise<number> {
  const userInv = await def.userKV.get<def.IUserInventory>(userId);
  return userInv?.lock ?? 0;
}

export async function getMines(userId: discord.Snowflake): Promise<number> {
  const userInv = await def.userKV.get<def.IUserInventory>(userId);
  return userInv?.mine ?? 0;
}

export async function getLives(userId: discord.Snowflake): Promise<number> {
  const userInv = await def.userKV.get<def.IUserInventory>(userId);
  return userInv?.life ?? 0;
}

export async function getPicks(userId: discord.Snowflake): Promise<number> {
  const userInv = await def.userKV.get<def.IUserInventory>(userId);
  return userInv?.pick ?? 0;
}

export async function getGems(userId: discord.Snowflake): Promise<number> {
  const userInv = await def.userKV.get<def.IUserInventory>(userId);
  return userInv?.gem ?? 0;
}

export async function getLockEquipped(
  userId: discord.Snowflake
): Promise<number> {
  const userInv = await def.userKV.get<def.IUserInventory>(userId);
  return userInv?.lEquip ?? 0;
}

export async function getMineEquipped(
  userId: discord.Snowflake
): Promise<number> {
  const userInv = await def.userKV.get<def.IUserInventory>(userId);
  return userInv?.mEquip ?? 0;
}

export async function getMineUses(userId: discord.Snowflake): Promise<number> {
  const userInv = await def.userKV.get<def.IUserInventory>(userId);
  return userInv?.mUse ?? 0;
}

export const enum Item {
  // descriptions
  padlock = 'put a padlock on your account to prevent people from robbing you.',
  landmine = 'this item blows up when someone tries to rob you, killing them.',
  lifesaver = 'use this item to save yourself from dying!',
  pickaxe = 'use this item to mine and collect valuable resources.',
  gem = 'A valuable material that you can sell for profit.',
  // names
  padlockName = 'Padlock',
  landmineName = 'Landmine',
  lifesaverName = 'Backup Heart',
  pickaxeName = 'Pickaxe',
  gemName = 'Gem',
  // ids
  padlockID = 'padlock',
  landmineID = 'landmine',
  lifesaverID = 'heart',
  pickaxeID = 'pickaxe',
  gemID = 'gem',
  // shortforms
  padlockSF = 'lock',
  landmineSF = 'mine',
  lifesaverSF = 'heart',
  pickaxeSF = 'pick',
  // prices
  padlockPrice = 750,
  landminePrice = 1750,
  lifesaverPrice = 1750,
  pickaxePrice = 1750
}

// Item Specific Configuration
export const enum ItemConfig {
  mineUses = 3,
  mineChance = 0.65,
  lockPentalty = 250,
  gemPrice = 50 //fix
}

export const enum ItemTypes {
  Tool = 'Tool',
  Collectible = 'Collectible',
  PowerUp = 'Power-Up'
}

export type ItemInfo = {
  name: string;
  id: string;
  shortform: string;
  symbol: string;
  price: number;
  itemType: string;
};

export type ItemWithInfo = { item: Item; itemInfo: ItemInfo };

export const itemConfig: Map<Item, ItemInfo> = new Map([
  [
    Item.padlock,
    {
      name: 'Padlock',
      id: 'padlock',
      shortform: 'lock',
      symbol: def.standards.shopIcons.lock,
      price: 750,
      itemType: ItemTypes.Tool
    }
  ],
  [
    Item.landmine,
    {
      name: 'Landmine',
      id: 'landmine',
      shortform: 'mine',
      symbol: def.standards.shopIcons.mine,
      price: 1750,
      itemType: ItemTypes.Tool
    }
  ],
  [
    Item.lifesaver,
    {
      name: 'Backup Heart',
      id: 'heart',
      shortform: 'heart',
      symbol: def.standards.shopIcons.life,
      price: 1750,
      itemType: ItemTypes.PowerUp
    }
  ],
  [
    Item.pickaxe,
    {
      name: 'Pickaxe',
      id: 'pickaxe',
      shortform: 'pick',
      symbol: def.standards.shopIcons.pick,
      price: 1750,
      itemType: ItemTypes.Tool
    }
  ]
]);

export const findItemByName = (name: string): ItemWithInfo | null => {
  name = name.toLowerCase();
  for (const [item, itemInfo] of itemConfig.entries()) {
    if (name === Item.gemID) return { itemInfo, item };
    if (
      itemInfo.id.toLowerCase() === name ||
      itemInfo.shortform.toLowerCase() === name
    ) {
      return { itemInfo, item };
    }
  }
  return null;
};

export const renderEmbed = (itemWithInfos: ItemWithInfo[]): discord.Embed => {
  const toField = ({
    item,
    itemInfo
  }: ItemWithInfo): { name: string; value: string } => {
    const name =
      itemInfo.symbol +
      ' ' +
      itemInfo.name +
      ' -- ' +
      `${
        itemInfo.price > 0
          ? `**${def.standards.currency}${itemInfo.price}**`
          : null
      }`;
    const value = [
      `**Type: \`${itemInfo.itemType}\` | ID: [\`${itemInfo.id}\`](https://pylon.bot)**`,
      `${item}`
    ]
      .filter((x) => x != null)
      .join('\n');
    return { name, value };
  };

  return new discord.Embed({
    fields: itemWithInfos.map((item) => toField(item))
  });
};

export const newEmbed = (
  shopItem: string,
  price: number,
  itemType: ItemTypes,
  info: string,
  imageLink: string
): discord.Embed => {
  const color = def.standards.embeds.general;
  const title = `${shopItem}`;
  const description = [
    `**Type: \`${itemType}\`**`,
    '',
    info,
    '',
    `**PRICE** - **${
      price === 0 ? 'Cannot be purchased' : `${def.standards.currency}${price}`
    }**`,
    `**SELLS** - **${def.standards.currency}${
      price === 0 ? `${ItemConfig.gemPrice}` : `${Math.round(price / 10)}`
    }**`
  ].join('\n');
  return new discord.Embed({
    title: title,
    description: description,
    color: color,
    thumbnail: { url: imageLink }
  });
};

export const extendDescriptions = {
  padlock:
    'Put a padlock on your account to prevent people from robbing you. Once this item is broken, it cannot return, unless you buy a new one.',
  heart:
    'Use the Backup Heart to save yourself when dying! If this item is in your inventory, it will be used and prevent you from losing all of your coins.',
  landmine: `This item has a **${ItemConfig.mineChance *
    100}%** chance to instantly kill anyone that tries to rob you. Has **${
    ItemConfig.mineUses
  }** uses.`,
  pickaxe: `Use the pickaxe alongside the \`mine\` command to harvest valuable **${def.standards.shopIcons.gem} Gem**s, which you can then sell for some profit!`,
  gem: `**${def.standards.shopIcons.gem} Gem**s can be acquired by using the \`mine\` command. You can then sell these Gems for profit!`
};
export const itemThumbnails = {
  padlock: 'https://images.emojiterra.com/twitter/512px/1f512.png',
  landmine: 'https://images.emojiterra.com/twitter/v13.0/512px/1f9e8.png',
  heart:
    'https://creazilla-store.fra1.digitaloceanspaces.com/emojis/54393/red-heart-emoji-clipart-md.png',
  pickaxe: 'https://images.emojiterra.com/twitter/v13.0/512px/26cf.png',
  gem: 'https://images.emojiterra.com/twitter/v13.0/512px/1f48e.png'
};
// prettier-ignore
export const hardItemTypes = { padlock: ItemTypes.Tool, landmine: ItemTypes.Tool, heart: ItemTypes.PowerUp, pickaxe: ItemTypes.Tool, gem: ItemTypes.Collectible };
const getUserItems = async (userId: discord.Snowflake) => {};

export const purchaseItem = async (
  userId: discord.Snowflake,
  shopItem: string,
  count: number
) => {
  shopItem = shopItem.toLowerCase();
  const userBalance = await op.getBalance(userId);
};

export async function buyItem(
  userId: discord.Snowflake,
  shopItem: string,
  message: discord.Message,
  count: number
) {
  const balance = await op.getBalance(userId);
  const sItem = shopItem.toLowerCase();
  switch (sItem) {
    case Item.padlockID:
    case Item.padlockSF:
      if (balance < Item.padlockPrice * count)
        return message.reply(`You don't have that many coins!`);
      await op.incrementBalance(userId, -(Item.padlockPrice * count));
      await intoInventory.incrementLocksInInventory(userId, count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        Item.padlockPrice
      );
      break;
    case Item.landmineID:
    case Item.landmineSF:
      if (balance < Item.landminePrice * count)
        return message.reply(`You don't have that many coins!`);
      await op.incrementBalance(userId, -(Item.landminePrice * count));
      await intoInventory.incrementMinesInInventory(userId, count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        Item.landminePrice
      );
      break;
    case Item.lifesaverID:
    case Item.lifesaverSF:
      if (balance < Item.lifesaverPrice * count)
        return message.reply(`You don't have that many coins!`);
      await op.incrementBalance(userId, -(Item.lifesaverPrice * count));
      await intoInventory.incrementLivesInInventory(userId, count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        Item.lifesaverPrice
      );
      break;
    case Item.pickaxeID:
    case Item.pickaxeSF:
      if (balance < Item.pickaxePrice * count)
        return message.reply(`You don't have that many coins!`);
      await op.incrementBalance(userId, -(Item.pickaxePrice * count));
      await intoInventory.incrementPicksInInventory(userId, count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        Item.pickaxePrice
      );
      break;
  }
}

export async function sellItem(
  userId: discord.Snowflake,
  shopItem: string,
  message: discord.Message,
  count: number
) {
  // grab information
  const balance = await op.getBalance(userId);
  const userLocks = await getLocks(userId);
  const userMines = await getMines(userId);
  const userLives = await getLives(userId);
  const userPicks = await getPicks(userId);
  const userGems = await getGems(userId);
  const sItem = shopItem.toLowerCase();
  switch (sItem) {
    case Item.padlockID:
    case Item.padlockSF:
      if (count > userLocks)
        return message.reply(`You don't have that many Padlocks!`);
      const lockSell = (Item.padlockPrice * count) / 10;
      await op.incrementBalance(userId, lockSell);
      await intoInventory.incrementLocksInInventory(userId, -count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        Item.padlockPrice,
        true
      );
      break;
    case Item.landmineID:
    case Item.landmineSF:
      if (count > userMines)
        return message.reply(`You don't have that many Landmines!`);
      const mineSell = (Item.landminePrice * count) / 10;
      await op.incrementBalance(userId, mineSell);
      await intoInventory.incrementMinesInInventory(userId, -count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        Item.landminePrice,
        true
      );
      break;
    case Item.lifesaverID:
    case Item.lifesaverSF:
      if (count > userLives)
        return message.reply(`You don't have that many Backup Hearts!`);
      const lifeSell = (Item.lifesaverPrice * count) / 10;
      await op.incrementBalance(userId, lifeSell);
      await intoInventory.incrementLivesInInventory(userId, -count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        Item.lifesaverPrice,
        true
      );
      break;
    case Item.pickaxeID:
    case Item.pickaxeSF:
      if (count > userPicks)
        return message.reply(`You don't have that many Pickaxes!`);
      const pickSell = (Item.pickaxePrice * count) / 10;
      await op.incrementBalance(userId, pickSell);
      await intoInventory.incrementPicksInInventory(userId, -count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        Item.pickaxePrice,
        true
      );
      break;
    case Item.gemID:
      if (count > userGems)
        return message.reply(`You don't have that many Gems!`);
      const gemSell = ItemConfig.gemPrice * count;
      await op.incrementBalance(userId, gemSell);
      await intoInventory.incrementGemsInInventory(userId, -count);
      await intoInventory.confirmPurchase(
        count,
        shopItem,
        message,
        ItemConfig.gemPrice,
        true
      );
      break;
  }
}

export async function useItem(
  userId: discord.Snowflake,
  inventoryItem: string,
  message: discord.Message
) {
  const locks = await getLocks(userId);
  const equippedLock = await getLockEquipped(userId);
  const mines = await getMines(userId);
  const equippedMine = await getMineEquipped(userId);
  const iItem = inventoryItem.toLowerCase();
  switch (iItem) {
    case Item.padlockID:
    case Item.padlockSF:
      if (locks === 0)
        return message.reply(`You don't have that item in your inventory!`);
      if (equippedLock > 0)
        return message.reply(`You already have that item equipped!`);
      await intoInventory.incrementLocksInInventory(userId, -1);
      await intoInventory.changedLockEquip(userId);
      await message.reply(
        `You equipped a **${def.standards.shopIcons.lock} Padlock**. Anyone who tries to steal from you will automatically fail, however this is only a one-time use.`
      );
      break;
    case Item.landmineID:
    case Item.landmineSF:
      if (mines === 0)
        return message.reply(`You don't have that item in your inventory!`);
      if (equippedMine > 0)
        return message.reply(`You already have that item equipped!`);
      await intoInventory.incrementMinesInInventory(userId, -1);
      await intoInventory.changeMineEquip(userId);
      await intoInventory.resetMineUses(userId);
      await message.reply(
        `You put down a **${def.standards.shopIcons.mine} Landmine**. 3 people who try to steal from you have a chance of dying and losing all their coins.`
      );
      break;
  }
}
