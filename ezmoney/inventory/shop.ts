import * as def from '../config/setup';
import * as op from '../config/functions';
import * as inventory from './inv-setup';
import { Item } from './inv-setup';
import obc from '../config/setup';

obc.subcommand('shop', async (shopCommands) => {
  shopCommands.default(
    (a) => ({ shopItem: a.stringOptional() }),
    async (message, { shopItem }) => {
      if (shopItem === null) {
        const embed = inventory.renderEmbed(
          [...inventory.itemConfig.entries()].map(([item, itemInfo]) => ({
            item,
            itemInfo
          }))
        );
        embed
          .setColor(def.standards.embeds.general)
          .setTitle('All Items')
          .setDescription(
            `to buy an item, write \`.buy <id>\`. for more information, use \`.shop <id>\``
          );
        await message.reply(embed);
      } else {
        const item = inventory.findItemByName(shopItem);
        if (item == null) {
          return message.reply({
            content: `Item with name: **${shopItem}** does not exist, use \`.shop\` to list items that can be purchased.`,
            allowedMentions: {}
          });
        }
        const auditItem = shopItem.toLowerCase();
        switch (auditItem) {
          case Item.padlockID:
          case Item.padlockSF:
            const userLocks = await inventory.getLocks(message.author.id);
            const lockEmbed = inventory.newEmbed(
              `**${Item.padlockName}** ${
                userLocks >= 1 ? `(${userLocks} Owned)` : ''
              }`,
              Item.padlockPrice,
              inventory.ItemTypes.Tool,
              inventory.extendDescriptions.padlock,
              'https://images.emojiterra.com/twitter/512px/1f512.png'
            );
            await message.reply(lockEmbed);
            break;
          case Item.landmineID:
          case Item.landmineSF:
            const userMines = await inventory.getMines(message.author.id);
            const lmEmbed = inventory.newEmbed(
              `**${Item.landmineName}** ${
                userMines >= 1 ? `(${userMines} Owned)` : ''
              }`,
              Item.landminePrice,
              inventory.ItemTypes.Tool,
              inventory.extendDescriptions.landmine,
              'https://images.emojiterra.com/twitter/v13.0/512px/1f9e8.png'
            );
            await message.reply(lmEmbed);
            break;
          case Item.lifesaverID:
          case Item.lifesaverSF:
            const userLives = await inventory.getLives(message.author.id);
            const lifeEmbed = inventory.newEmbed(
              `**${Item.lifesaverName}** ${
                userLives >= 1 ? `(${userLives} Owned)` : ''
              }`,
              Item.lifesaverPrice,
              inventory.ItemTypes.PowerUp,
              inventory.extendDescriptions.heart,
              'https://creazilla-store.fra1.digitaloceanspaces.com/emojis/54393/red-heart-emoji-clipart-md.png'
            );
            await message.reply(lifeEmbed);
            break;
          case Item.pickaxeID:
          case Item.pickaxeSF:
            const userPicks = await inventory.getPicks(message.author.id);
            const pickEmbed = inventory.newEmbed(
              `**${Item.pickaxeName}** ${
                userPicks >= 1 ? `(${userPicks} Owned)` : ''
              }`,
              Item.pickaxePrice,
              inventory.ItemTypes.Tool,
              inventory.extendDescriptions.pickaxe,
              'https://images.emojiterra.com/twitter/v13.0/512px/26cf.png'
            );
            await message.reply(pickEmbed);
            break;
          case Item.gemID:
            const userGems = await inventory.getGems(message.author.id);
            const gembed = inventory.newEmbed(
              `**${Item.gemName}** ${
                userGems >= 1 ? `(${userGems} Owned)` : ''
              }`,
              0,
              inventory.ItemTypes.Collectible,
              inventory.extendDescriptions.gem,
              'https://images.emojiterra.com/twitter/v13.0/512px/1f48e.png'
            );
            await message.reply(gembed);
            break;
        }
      }
    }
  );
});
