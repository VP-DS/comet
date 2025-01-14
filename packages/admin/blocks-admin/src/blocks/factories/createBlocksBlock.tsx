import { StackPage, StackPageTitle, StackSwitch, StackSwitchApiContext, UndoSnackbar, useSnackbarApi } from "@comet/admin";
import { Add, Copy, Delete, Invisible, Paste, Visible } from "@comet/admin-icons";
import { Checkbox, FormControlLabel, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as React from "react";
import { FormattedMessage } from "react-intl";
import { v4 as uuid } from "uuid";

import { AdminComponentButton, AdminComponentPaper, useBlockContext } from "../..";
import { CannotPasteBlockDialog } from "../../clipboard/CannotPasteBlockDialog";
import { useBlockClipboard } from "../../clipboard/useBlockClipboard";
import { HoverPreviewComponent } from "../../iframebridge/HoverPreviewComponent";
import { SelectPreviewComponent } from "../../iframebridge/SelectPreviewComponent";
import { parallelAsyncEvery } from "../../utils/parallelAsyncEvery";
import { AddBlockDrawer } from "../common/AddBlockDrawer";
import { AdminComponentStickyFooter } from "../common/AdminComponentStickyFooter";
import { AdminComponentStickyHeader } from "../common/AdminComponentStickyHeader";
import { BlockRow } from "../common/blockRow/BlockRow";
import { createBlockSkeleton } from "../helpers/createBlockSkeleton";
import { BlockInterface, BlockState, DispatchSetStateAction, PreviewContent } from "../types";
import { resolveNewState } from "../utils";

interface BlocksBlockItem<T extends BlockInterface = BlockInterface> {
    [key: string]: unknown;
    key: string;
    type: string;
    visible: boolean;
    selected: boolean;
    props: BlockState<T>;
    slideIn: boolean;
}

type RemovedBlocksBlockItem = BlocksBlockItem & { removedAt: number };

export interface BlocksBlockState {
    blocks: BlocksBlockItem[];
}

export interface BlocksBlockFragment {
    blocks: {
        [key: string]: unknown;
        key: string;
        type: string;
        visible: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        props: any;
    }[];
}

type BlockType = string;

interface AdditionalItemField<Value = unknown> {
    defaultValue: Value;
}

interface CreateBlocksBlockOptions {
    name: string;
    displayName?: React.ReactNode;
    supportedBlocks: Record<BlockType, BlockInterface>;
    additionalItemFields?: Record<string, AdditionalItemField>;
    AdditionalItemContextMenuItems?: React.FunctionComponent<{
        item: BlocksBlockItem;
        onChange: (item: BlocksBlockItem) => void;
        onMenuClose: () => void;
    }>;
    AdditionalItemContent?: React.FunctionComponent<{ item: BlocksBlockItem }>;
}

export function createBlocksBlock({
    supportedBlocks,
    name,
    displayName = <FormattedMessage id="comet.blocks.blocks.name" defaultMessage="Blocks" />,
    additionalItemFields = {},
    AdditionalItemContextMenuItems,
    AdditionalItemContent,
}: CreateBlocksBlockOptions): BlockInterface<BlocksBlockFragment, BlocksBlockState> {
    if (Object.keys(supportedBlocks).length === 0) {
        throw new Error("Blocks block with no supported block is not allowed. Please specify at least two supported blocks.");
    }

    if (Object.keys(supportedBlocks).length === 1) {
        throw new Error("Blocks block with a single block is not allowed. Please use a list block (createListBlock()) instead.");
    }

    function blockForType(type: string): BlockInterface | null {
        return supportedBlocks[type] ?? null;
    }

    function typeForBlock(targetBlock: Pick<BlockInterface, "name">): string | null {
        return Object.entries(supportedBlocks).find(([, block]) => block.name === targetBlock.name)?.[0] ?? null;
    }

    const BlocksBlock: BlockInterface<BlocksBlockFragment, BlocksBlockState> = {
        ...createBlockSkeleton(),

        name,

        displayName,

        defaultValues: () => ({ blocks: [] }),

        input2State: (input) => {
            const blocks: BlocksBlockItem[] = [];

            for (const item of input.blocks) {
                const block = blockForType(item.type);

                if (!block) {
                    // eslint-disable-next-line no-console
                    console.warn(`Unknown block type "${item.type}"`);
                    continue;
                }

                blocks.push({
                    ...item,
                    props: block.input2State(item.props),
                    ...Object.keys(additionalItemFields).reduce((fields, field) => ({ ...fields, [field]: item[field] }), {}),
                    selected: false,
                    slideIn: false,
                });
            }

            return {
                blocks,
            };
        },
        state2Output: (s) => {
            return {
                blocks: s.blocks.map((c) => {
                    const block = blockForType(c.type);
                    if (!block) {
                        throw new Error(`No Block found for type ${c.type}`); // for TS
                    }
                    return {
                        key: c.key,
                        visible: c.visible,
                        type: c.type,
                        props: block.state2Output(c.props),
                        ...Object.keys(additionalItemFields).reduce((fields, field) => ({ ...fields, [field]: c[field] }), {}),
                    };
                }),
            };
        },

        output2State: async (output, context) => {
            const state: BlocksBlockState = {
                blocks: [],
            };

            for (const item of output.blocks) {
                const block = blockForType(item.type);

                if (!block) {
                    throw new Error(`No Block found for type ${item.type}`);
                }

                state.blocks.push({
                    ...item,
                    props: await block.output2State(item.props, context),
                    selected: false,
                });
            }

            return state;
        },

        createPreviewState: (state, previewCtx) => {
            return {
                adminRoute: previewCtx.parentUrl,
                blocks: state.blocks
                    .filter((c) => (previewCtx.showVisibleOnly ? c.visible : true)) // depending on context show all blocks or only visible blocks
                    .map((c) => {
                        const blockAdminRoute = `${previewCtx.parentUrl}/${c.key}/blocks`;
                        const block = blockForType(c.type);
                        if (!block) {
                            throw new Error(`No Block found for type ${c.type}`); // for TS
                        }
                        return {
                            key: c.key,
                            visible: c.visible,
                            type: c.type,
                            adminRoute: blockAdminRoute,
                            props: block.createPreviewState(c.props, { ...previewCtx, parentUrl: blockAdminRoute }),
                            ...Object.keys(additionalItemFields).reduce((fields, field) => ({ ...fields, [field]: c[field] }), {}),
                        };
                    }),
                adminMeta: { route: previewCtx.parentUrl },
            };
        },
        isValid: async (state) =>
            parallelAsyncEvery(state.blocks, async (c) => {
                const block = blockForType(c.type);
                if (!block) {
                    throw new Error(`No Block found for type ${c.type}`); // for TS
                }
                return block.isValid(c.props);
            }),
        childBlockCount: (state) => state.blocks.length,

        anchors: (state) => {
            return state.blocks.reduce<string[]>((anchors, child) => {
                const block = blockForType(child.type);
                if (!block) {
                    throw new Error(`No Block found for type ${child.type}`); // for TS
                }
                return [...anchors, ...(block.anchors?.(child.props) ?? [])];
            }, []);
        },

        definesOwnPadding: true,

        AdminComponent: ({ state, updateState }) => {
            const toggleVisible = React.useCallback(
                (blockKey: string) => {
                    updateState((prevState) => ({
                        ...prevState,
                        blocks: prevState.blocks.map((c) => (c.key === blockKey ? { ...c, visible: !c.visible } : c)),
                    }));
                },
                [updateState],
            );

            const [showAddBlockDrawer, setShowAddBlockDrawer] = React.useState(false);
            const [beforeIndex, setBeforeIndex] = React.useState<number>();
            const [cannotPasteBlockError, setCannotPasteBlockError] = React.useState<React.ReactNode>();
            const blockContext = useBlockContext();

            const snackbarApi = useSnackbarApi();

            React.useEffect(() => {
                if (state.blocks.some((block) => block.slideIn)) {
                    const timeoutHandle = window.setTimeout(() => {
                        updateState((prevState) => ({ ...prevState, blocks: prevState.blocks.map((block) => ({ ...block, slideIn: false })) }));
                    }, 1000);

                    return () => {
                        window.clearTimeout(timeoutHandle);
                    };
                }
            }, [state.blocks, updateState]);

            const handleUndoClick = React.useCallback(
                (removedBlocks: RemovedBlocksBlockItem[] | undefined) => {
                    if (!removedBlocks) {
                        return;
                    }

                    updateState((prevState) => {
                        const blocks = [...prevState.blocks];
                        removedBlocks?.forEach((removedBlock) => {
                            const { removedAt, ...block } = removedBlock;
                            blocks.splice(removedAt, 0, block);
                        });

                        return { ...prevState, blocks };
                    });
                },
                [updateState],
            );

            const deleteBlocks = React.useCallback(
                (blockKeys: string[]) => {
                    updateState((prevState) => {
                        const blocksToRemove = prevState.blocks
                            .map((block, index) => {
                                return { ...block, removedAt: index };
                            })
                            .filter((block) => {
                                return blockKeys.includes(block.key);
                            });

                        snackbarApi.showSnackbar(
                            <UndoSnackbar
                                message={
                                    <FormattedMessage
                                        id="comet.blocks.list.blockDeleted"
                                        defaultMessage="{count, plural, one {block} other {# blocks}} deleted"
                                        values={{ count: blocksToRemove.length }}
                                    />
                                }
                                payload={blocksToRemove}
                                onUndoClick={(blocksToRemove) => {
                                    handleUndoClick(blocksToRemove);
                                }}
                            />,
                        );

                        return { ...prevState, blocks: prevState.blocks.filter((c) => !blockKeys.includes(c.key)) };
                    });
                },
                [handleUndoClick, snackbarApi, updateState],
            );

            const handleDeleteAllSelectedBlocks = () => {
                const blocksToDelete = state.blocks.filter((c) => {
                    return c.selected;
                });

                deleteBlocks(
                    blocksToDelete.map((block) => {
                        return block.key;
                    }),
                );
            };

            const addNewBlock = (type: BlockType, beforeIndex?: number) => {
                const key = uuid();

                const block = blockForType(type);
                if (!block) {
                    throw new Error(`No Block found for type ${type}`);
                }
                const newItem: BlocksBlockItem = {
                    key,
                    type,
                    visible: true,
                    selected: false,
                    props: block.defaultValues(),
                    slideIn: true,
                    ...Object.entries(additionalItemFields).reduce((fields, [field, { defaultValue }]) => ({ ...fields, [field]: defaultValue }), {}),
                };

                const newBlocks = [...state.blocks];

                if (beforeIndex !== undefined) {
                    newBlocks.splice(beforeIndex, 0, newItem);
                } else {
                    newBlocks.push(newItem);
                }

                updateState((prevState) => ({
                    ...prevState,
                    blocks: newBlocks,
                }));

                return key;
            };

            const createUpdateSubBlocksFn = React.useCallback(
                (blockKey: string) => {
                    const updateSubBlocksFn: DispatchSetStateAction<unknown> = (setStateAction) => {
                        updateState((prevState) => ({
                            ...prevState,
                            blocks: prevState.blocks.map((c) =>
                                c.key === blockKey ? { ...c, props: resolveNewState({ prevState: c.props, setStateAction }) } : c,
                            ),
                        }));
                    };
                    return updateSubBlocksFn;
                },
                [updateState],
            );

            const { updateClipboardContent, getClipboardContent } = useBlockClipboard({ supports: Object.values(supportedBlocks) });

            const pasteBlock = async (insertAt: number) => {
                const response = await getClipboardContent();

                if (!response.canPaste) {
                    setCannotPasteBlockError(response.error);
                    return;
                }

                const { content } = response;

                updateState((prevState) => {
                    const newBlocks: BlocksBlockItem[] = content.map((block) => {
                        const type = typeForBlock(block);

                        if (!type) {
                            throw new Error(`No type found for block "${block.name}"`);
                        }

                        return {
                            key: uuid(),
                            type,
                            selected: false,
                            visible: block.visible,
                            props: block.state,
                            slideIn: true,
                            ...block.additionalFields,
                        };
                    });

                    return {
                        ...prevState,
                        blocks: [...prevState.blocks.slice(0, insertAt), ...newBlocks, ...prevState.blocks.slice(insertAt)].map((block) => ({
                            ...block,
                            selected: false,
                        })),
                    };
                });
            };

            const handleAddBlockClick = (beforeIndex?: number) => {
                setShowAddBlockDrawer(true);
                setBeforeIndex(beforeIndex);
            };

            const handleCloseAddBlockDrawer = () => {
                setShowAddBlockDrawer(false);
                setBeforeIndex(undefined);
            };

            const handleToggleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
                const selected = event.target.checked;
                updateState((prevState) => {
                    return {
                        ...prevState,
                        blocks: prevState.blocks.map((block) => {
                            return { ...block, selected };
                        }),
                    };
                });
            };

            const handleSelectBlock = (currentBlock: BlocksBlockItem, select: boolean) => {
                updateState((prevState) => {
                    return {
                        ...prevState,
                        blocks: prevState.blocks.map((block) => {
                            return { ...block, selected: block === currentBlock ? select : block.selected };
                        }),
                    };
                });
            };

            const handleCopySelectedBlocks = () => {
                const blocksToCopy = state.blocks
                    .filter((block) => block.selected)
                    .map((block) => {
                        const blockInterface = blockForType(block.type);

                        if (!blockInterface) {
                            throw new Error(`No Block found for type ${block.type}`);
                        }

                        return {
                            name: blockInterface.name,
                            visible: block.visible,
                            state: block.props,
                            additionalFields: Object.keys(additionalItemFields).reduce((fields, field) => ({ ...fields, [field]: block[field] }), {}),
                        };
                    });

                updateClipboardContent(blocksToCopy);
            };

            const selectedCount = state.blocks.filter((block) => block.selected).length;

            return (
                <>
                    <StackSwitch>
                        <StackPage name="main">
                            <StackSwitchApiContext.Consumer>
                                {(stackApi) => {
                                    return (
                                        <SelectPreviewComponent>
                                            <AdminComponentPaper disablePadding>
                                                <AdminComponentStickyHeader>
                                                    <BlockListHeader>
                                                        {state.blocks.length ? (
                                                            <SelectAllFromControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={selectedCount === state.blocks.length && selectedCount > 0}
                                                                        indeterminate={selectedCount > 0 && selectedCount !== state.blocks.length}
                                                                        onChange={handleToggleSelectAll}
                                                                    />
                                                                }
                                                                label={
                                                                    <FormattedMessage id="comet.blocks.list.selectAll" defaultMessage="Select all" />
                                                                }
                                                            />
                                                        ) : (
                                                            <div />
                                                        )}
                                                        <BlockListHeaderActionContainer>
                                                            {selectedCount > 0 && (
                                                                <>
                                                                    <IconButton onClick={handleDeleteAllSelectedBlocks} size="large">
                                                                        <Delete />
                                                                    </IconButton>
                                                                    <IconButton onClick={handleCopySelectedBlocks} size="large">
                                                                        <Copy />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                            <IconButton onClick={() => pasteBlock(0)} size="large">
                                                                <Paste />
                                                            </IconButton>
                                                        </BlockListHeaderActionContainer>
                                                    </BlockListHeader>
                                                </AdminComponentStickyHeader>
                                                <div>
                                                    {state.blocks.map((data, blockIndex) => {
                                                        const block = blockForType(data.type);
                                                        if (!block) {
                                                            return null;
                                                        }

                                                        return (
                                                            <HoverPreviewComponent key={data.key} componentSlug={`${data.key}/blocks`}>
                                                                <BlockRow
                                                                    name={block.dynamicDisplayName?.(data.props) ?? block.displayName}
                                                                    id={data.key}
                                                                    previewContent={block.previewContent(data.props, blockContext)}
                                                                    index={blockIndex}
                                                                    onContentClick={() => {
                                                                        stackApi.activatePage("blocks", data.key);
                                                                    }}
                                                                    onDeleteClick={() => {
                                                                        deleteBlocks([data.key]);
                                                                    }}
                                                                    moveBlock={(dragIndex: number, hoverIndex: number) => {
                                                                        const blocks = [...state.blocks];
                                                                        const dragItem = state.blocks[dragIndex];
                                                                        blocks[dragIndex] = state.blocks[hoverIndex];
                                                                        blocks[hoverIndex] = dragItem;
                                                                        updateState((prevState) => ({ ...prevState, blocks }));
                                                                    }}
                                                                    visibilityButton={
                                                                        <IconButton onClick={() => toggleVisible(data.key)} size="small">
                                                                            {data.visible ? <Visible color="secondary" /> : <Invisible />}
                                                                        </IconButton>
                                                                    }
                                                                    onAddNewBlock={handleAddBlockClick}
                                                                    onCopyClick={() => {
                                                                        const block = blockForType(data.type);

                                                                        if (!block) {
                                                                            throw new Error(`No Block found for type ${data.type}`);
                                                                        }
                                                                        updateClipboardContent([
                                                                            {
                                                                                name: block.name,
                                                                                visible: data.visible,
                                                                                state: data.props,
                                                                                additionalFields: Object.keys(additionalItemFields).reduce(
                                                                                    (fields, field) => ({ ...fields, [field]: data[field] }),
                                                                                    {},
                                                                                ),
                                                                            },
                                                                        ]);
                                                                    }}
                                                                    onPasteClick={() => {
                                                                        pasteBlock(blockIndex + 1);
                                                                    }}
                                                                    selected={data.selected}
                                                                    onSelectedClick={(selected) => {
                                                                        handleSelectBlock(data, selected);
                                                                    }}
                                                                    isValidFn={() => block.isValid(data.props)}
                                                                    slideIn={data.slideIn}
                                                                    hideBottomInsertBetweenButton={blockIndex >= state.blocks.length - 1}
                                                                    additionalMenuItems={(onMenuClose) =>
                                                                        AdditionalItemContextMenuItems ? (
                                                                            <AdditionalItemContextMenuItems
                                                                                item={data}
                                                                                onChange={(updatedItem) => {
                                                                                    updateState((previousState) => ({
                                                                                        blocks: previousState.blocks.map((block) =>
                                                                                            block.key === data.key ? updatedItem : block,
                                                                                        ),
                                                                                    }));
                                                                                }}
                                                                                onMenuClose={onMenuClose}
                                                                            />
                                                                        ) : undefined
                                                                    }
                                                                    additionalContent={
                                                                        AdditionalItemContent ? <AdditionalItemContent item={data} /> : undefined
                                                                    }
                                                                />
                                                            </HoverPreviewComponent>
                                                        );
                                                    })}
                                                    {state.blocks.length === 0 ? (
                                                        <AdminComponentButton onClick={() => handleAddBlockClick()} variant="primary" size="large">
                                                            <LargeAddButtonContent>
                                                                <LargeAddButtonIcon />
                                                                <Typography>
                                                                    <FormattedMessage id="comet.blocks.list.addNewBlock" defaultMessage="Add block" />
                                                                </Typography>
                                                            </LargeAddButtonContent>
                                                        </AdminComponentButton>
                                                    ) : (
                                                        <AdminComponentStickyFooter>
                                                            <AdminComponentButton
                                                                onClick={() => handleAddBlockClick()}
                                                                variant="primary"
                                                                size="large"
                                                                startIcon={<Add />}
                                                            >
                                                                <FormattedMessage id="comet.blocks.list.addNewBlock" defaultMessage="Add block" />
                                                            </AdminComponentButton>
                                                        </AdminComponentStickyFooter>
                                                    )}
                                                </div>
                                            </AdminComponentPaper>
                                            <AddBlockDrawer
                                                open={showAddBlockDrawer}
                                                onClose={handleCloseAddBlockDrawer}
                                                blocks={supportedBlocks}
                                                onAddNewBlock={(type, addAndEdit) => {
                                                    const key = addNewBlock(type, beforeIndex);

                                                    if (addAndEdit) {
                                                        stackApi.activatePage("blocks", key);
                                                    }
                                                }}
                                            />
                                        </SelectPreviewComponent>
                                    );
                                }}
                            </StackSwitchApiContext.Consumer>
                        </StackPage>
                        <StackPage name="blocks" title="Block bearbeiten">
                            {(id) => (
                                <StackSwitchApiContext.Consumer>
                                    {(stackApi) => {
                                        const match = state.blocks.find((c) => c.key === id);

                                        if (!match) {
                                            stackApi.activatePage("main", "");
                                            return;
                                        }

                                        const block = blockForType(match.type);

                                        if (!block) {
                                            stackApi.activatePage("main", "");
                                            return;
                                        }

                                        return (
                                            <StackPageTitle title={block.displayName}>
                                                <block.AdminComponent state={match.props} updateState={createUpdateSubBlocksFn(id)} />
                                            </StackPageTitle>
                                        );
                                    }}
                                </StackSwitchApiContext.Consumer>
                            )}
                        </StackPage>
                    </StackSwitch>
                    {cannotPasteBlockError !== undefined && (
                        <CannotPasteBlockDialog open onClose={() => setCannotPasteBlockError(undefined)} error={cannotPasteBlockError} />
                    )}
                </>
            );
        },
        previewContent: (state, ctx) => {
            if (state.blocks.length === 0) {
                return [
                    {
                        type: "text",
                        content: (
                            <FormattedMessage
                                id="comet.blocks.list.count"
                                defaultMessage="{count, plural, =0 {No blocks} one {# block} other {# blocks}}"
                                values={{ count: state.blocks.length }}
                            />
                        ),
                    },
                ];
            }
            return state.blocks.reduce<PreviewContent[]>((prev, next) => {
                const block = blockForType(next.type);
                if (block) {
                    const nextPreviewContent = block.previewContent(next.props, ctx);
                    return [...prev, ...nextPreviewContent];
                } else {
                    return prev;
                }
            }, []);
        },
    };
    return BlocksBlock;
}

const BlockListHeader = styled("div")`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const BlockListHeaderActionContainer = styled("div")`
    padding: 12px 0;
`;

const SelectAllFromControlLabel = styled(FormControlLabel)`
    padding: 15px 10px 15px 7px;
`;

const LargeAddButtonContent = styled("span")`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4px 0;
`;

const LargeAddButtonIcon = styled(Add)`
    font-size: 24px;
    margin-bottom: 8px;
`;
