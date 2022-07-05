import { createTextImageBlock } from "@comet/cms-admin";
import { ImageBlock } from "@src/common/blocks/ImageBlock";
import { RichTextBlock } from "@src/common/blocks/RichTextBlock";

export const TextImageBlock = createTextImageBlock({ text: RichTextBlock, image: ImageBlock });