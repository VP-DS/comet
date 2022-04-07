import { classToPlain, plainToClass } from "class-transformer";
import { Allow, IsObject } from "class-validator";
import type { DraftBlockType, DraftEntityMutability, DraftInlineStyleType, RawDraftContentState, RawDraftEntityRange } from "draft-js";

import { createAppliedMigrationsBlockDataFactoryDecorator } from "../migrations/createAppliedMigrationsBlockDataFactoryDecorator";
import { BlockDataMigrationVersion } from "../migrations/decorators/BlockDataMigrationVersion";
import { SearchText } from "../search/get-search-text";
import {
    Block,
    BlockData,
    BlockDataFactory,
    BlockDataInterface,
    BlockInputFactory,
    BlockInputInterface,
    ExtractBlockInput,
    MigrateOptions,
    registerBlock,
} from "./block";
import { AnnotationBlockMeta, BlockField } from "./decorators/field";
import { strictBlockDataFactoryDecorator } from "./helpers/strictBlockDataFactoryDecorator";
import { strictBlockInputFactoryDecorator } from "./helpers/strictBlockInputFactoryDecorator";

interface CreateRichTextBlockOptions {
    link: Block;
    indexSearchText?: boolean;
}

// Replaces draft-js' RawDraftContentBlock
interface RawDraftInlineStyleRange {
    style: DraftInlineStyleType | "SUP" | "SUB"; // add our custom RTE styles
    offset: number;
    length: number;
}
// Copied from draft-js types, only RawDraftInlineStyleRange is replaced
interface RawDraftContentBlock {
    key: string;
    type: DraftBlockType;
    text: string;
    depth: number;
    inlineStyleRanges: Array<RawDraftInlineStyleRange>;
    entityRanges: Array<RawDraftEntityRange>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: { [key: string]: any };
}

// Replaces draft-js' RawDraftContentState
interface DraftJsFactoryProps<LinkBlockInput extends BlockInputInterface> {
    blocks: Array<RawDraftContentBlock>;
    entityMap: {
        [key: string]: { type: "LINK"; mutability: DraftEntityMutability; data: ReturnType<LinkBlockInput["toPlain"]> }; // extend this once more draftJS entities are supported
    };
}

interface DraftJsInput<LinkBlockInput extends BlockInputInterface> {
    blocks: Array<RawDraftContentBlock>;
    entityMap: {
        [key: string]: { type: "LINK"; mutability: DraftEntityMutability; data: LinkBlockInput }; // extend this once more draftJS entities are supported
    };
}

interface RichTextBlockDataInterface extends BlockDataInterface {
    draftContent: RawDraftContentState;
}

export interface RichTextBlockInputInterface<LinkBlockInput extends BlockInputInterface>
    extends BlockInputInterface<BlockDataInterface, { draftContent: DraftJsFactoryProps<LinkBlockInput> }> {
    draftContent: DraftJsInput<LinkBlockInput>;
}

export function createRichTextBlock<LinkBlock extends Block>({
    link: LinkBlock,
    indexSearchText = true,
}: CreateRichTextBlockOptions): Block<RichTextBlockDataInterface, RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>> {
    const BLOCK_NAME = "RichText";
    const MIGRATE: MigrateOptions = {
        migrations: [],
        version: 0,
    }; // Placeholder for future migrations

    @BlockDataMigrationVersion(MIGRATE.version)
    class RichTextBlockData extends BlockData {
        @BlockField({ type: "json" })
        draftContent: RawDraftContentState;

        searchText(): SearchText[] {
            if (!indexSearchText) {
                return [];
            }

            return this.draftContent.blocks.map((block) => {
                switch (block.type) {
                    case "header-one":
                        return { weight: "h1", text: block.text };
                    case "header-two":
                        return { weight: "h2", text: block.text };
                    case "header-three":
                        return { weight: "h3", text: block.text };
                    case "header-four":
                        return { weight: "h4", text: block.text };
                    case "header-five":
                        return { weight: "h5", text: block.text };
                    case "header-six":
                        return { weight: "h6", text: block.text };
                    default:
                        return block.text;
                }
            });
        }
    }

    class RichTextBlockInput implements RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>> {
        @Allow()
        @IsObject()
        @BlockField({ type: "json" })
        draftContent: DraftJsInput<ExtractBlockInput<LinkBlock>>;

        transformToBlockData(): RichTextBlockData {
            return plainToClass(RichTextBlockData, {
                ...this,
                draftContent: {
                    ...this.draftContent,
                    entityMap: Object.fromEntries(
                        Object.entries(this.draftContent.entityMap).map(([key, entity]) => {
                            if (entity.type === "LINK") {
                                return [
                                    key,
                                    {
                                        ...entity,
                                        // we need plainToClass here as data is not typed by class-transformer
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        data: LinkBlock.blockInputFactory(entity.data as any).transformToBlockData(),
                                    },
                                ];
                            } else {
                                return [key, entity];
                            }
                        }),
                    ),
                },
            });
        }
        toPlain(): ReturnType<RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>["toPlain"]> {
            return classToPlain(this) as ReturnType<RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>["toPlain"]>;
        }
    }

    const blockDataFactory: BlockDataFactory<RichTextBlockData> = ({ draftContent }: { draftContent: RawDraftContentState }) => {
        const entityMap = Object.fromEntries(
            Object.entries(draftContent.entityMap).map(([key, entity]) => {
                if (entity.type === "LINK") {
                    return [
                        key,
                        {
                            ...entity,
                            // we need plainToClass here as data is not typed by class-transformer
                            data: LinkBlock.blockDataFactory(entity.data),
                        },
                    ];
                } else {
                    return [key, entity];
                }
            }),
        );

        return plainToClass(RichTextBlockData, {
            draftContent: {
                ...draftContent,
                entityMap,
            },
        });
    };
    const blockInputFactory: BlockInputFactory<RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>> = (o) =>
        plainToClass(RichTextBlockInput, o);

    // Decorate BlockDataFactory
    let decorateBlockDataFactory = blockDataFactory;
    if (MIGRATE.migrations) {
        const blockDataFactoryDecorator1 = createAppliedMigrationsBlockDataFactoryDecorator(MIGRATE.migrations, BLOCK_NAME);
        decorateBlockDataFactory = blockDataFactoryDecorator1(decorateBlockDataFactory);
    }
    decorateBlockDataFactory = strictBlockDataFactoryDecorator(decorateBlockDataFactory);

    // Decorate BlockInputFactory
    const decorateBlockInputFactory = strictBlockInputFactoryDecorator(blockInputFactory);

    const RichTextBlock: Block<RichTextBlockData, RichTextBlockInputInterface<ExtractBlockInput<LinkBlock>>> = {
        name: BLOCK_NAME,
        blockDataFactory: decorateBlockDataFactory,
        blockInputFactory: decorateBlockInputFactory,
        blockMeta: new AnnotationBlockMeta(RichTextBlockData),
        blockInputMeta: new AnnotationBlockMeta(RichTextBlockInput),
    };

    registerBlock(RichTextBlock);

    return RichTextBlock;
}
