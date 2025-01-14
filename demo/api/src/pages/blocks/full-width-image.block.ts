import {
    BlockData,
    BlockDataInterface,
    BlockInput,
    ChildBlock,
    ChildBlockInput,
    createBlock,
    createOptionalBlock,
    ExtractBlockData,
    inputToData,
} from "@comet/blocks-api";
import { DamImageBlock } from "@comet/cms-api";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";
import { ValidateNested } from "class-validator";

const FullWidthImageContentBlock = createOptionalBlock(RichTextBlock);

class FullWidthImageBlockData extends BlockData {
    @ChildBlock(DamImageBlock)
    image: ExtractBlockData<typeof DamImageBlock>;

    @ChildBlock(FullWidthImageContentBlock)
    content: ExtractBlockData<typeof FullWidthImageContentBlock>;
}

class FullWidthImageBlockInput extends BlockInput {
    @ChildBlockInput(DamImageBlock)
    @ValidateNested()
    image: ExtractBlockData<typeof DamImageBlock>;

    @ChildBlockInput(FullWidthImageContentBlock)
    @ValidateNested()
    content: ExtractBlockData<typeof FullWidthImageContentBlock>;

    transformToBlockData(): BlockDataInterface {
        return inputToData(FullWidthImageBlockData, this);
    }
}

export const FullWidthImageBlock = createBlock(FullWidthImageBlockData, FullWidthImageBlockInput, "FullWidthImage");
