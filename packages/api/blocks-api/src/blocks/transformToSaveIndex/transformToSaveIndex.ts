import { FlatBlocks } from "../../flat-blocks/flat-blocks";
import { Block, BlockDataInterface, BlockIndex, BlockIndexItem } from "../block";

export function transformToSaveIndex(block: Block, blockData: BlockDataInterface): BlockIndex {
    const flatBlocks = new FlatBlocks(blockData, { name: block.name, visible: true, rootPath: "root" }); // breadthFirst or depthFirst is equally ok for the app, but the tests for original version are written for depth first traversal

    return flatBlocks.depthFirst().map((c) => {
        const blockIndexItem: BlockIndexItem = {
            blockname: c.name,
            jsonPath: c.pathToString(),
            visible: c.visible,
        };

        const indexData = c.block.indexData();
        if (indexData.dependencies && indexData.dependencies?.length > 0) {
            blockIndexItem.target = indexData;
        }

        return blockIndexItem;
    });
}
