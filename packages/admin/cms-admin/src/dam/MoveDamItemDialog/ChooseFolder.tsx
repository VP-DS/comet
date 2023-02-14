import { useQuery } from "@apollo/client";
import { ArrowRight, BallTriangle, PageTree, TreeCollapse, TreeExpand } from "@comet/admin-icons";
import { ListItem, SvgIconProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import escapeRegExp from "lodash.escaperegexp";
import React, { useRef } from "react";
import { FormattedMessage } from "react-intl";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

import { MarkedMatches } from "../../common/MarkedMatches";
import { GQLAllFoldersWithoutFiltersQuery, GQLAllFoldersWithoutFiltersQueryVariables } from "../../graphql.generated";
import { traversePreOrder, TreeMap } from "../../pages/pageTree/treemap/TreeMapUtils";
import { allFoldersQuery } from "./ChooseFolder.gql";
import { PageSearchMatch } from "./MoveDamItemDialog";

interface Folder {
    id: string;
    name: string;
    mpath: string[];
    parentId: string | null;
}

interface ChooseFolderProps {
    selectedId?: string | null;
    onFolderClick: (id: string | null) => void;
    searchQuery?: string;
    matches: PageSearchMatch[] | null;
    onMatchesChange: (matches: PageSearchMatch[]) => void;
    currentMatchIndex?: number;
    // onCurrentMatchIndexChange: (index: number | undefined) => void;
}

export const ChooseFolder = ({ selectedId, onFolderClick, searchQuery, matches, onMatchesChange, currentMatchIndex }: ChooseFolderProps) => {
    const [folderTree, setFolderTree] = React.useState<TreeMap<Folder>>(new TreeMap<Folder>());
    const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
    const [visibleNodes, setVisibleNodes] = React.useState<Array<{ element: Folder; level: number }>>([]);

    const { data, loading } = useQuery<GQLAllFoldersWithoutFiltersQuery, GQLAllFoldersWithoutFiltersQueryVariables>(allFoldersQuery, {
        fetchPolicy: "network-only",
    });

    React.useEffect(() => {
        if (data === undefined) {
            return;
        }

        const internalFolderTree = new TreeMap<Folder>();

        for (const folder of data.damFoldersWithoutFilters) {
            const parentId = folder.parent?.id ?? "root";

            let existingSiblingFolders: Folder[] = [];
            if (internalFolderTree.has(parentId)) {
                existingSiblingFolders = internalFolderTree.get(parentId) as Folder[];
            }

            internalFolderTree.set(parentId, [
                ...existingSiblingFolders,
                {
                    id: folder.id,
                    name: folder.name,
                    mpath: folder.mpath,
                    parentId: folder.parent?.id ?? null,
                },
            ]);
        }

        setFolderTree(internalFolderTree);
    }, [data]);

    React.useEffect(() => {
        const internalVisibleNodes: Array<{ element: Folder; level: number }> = [];

        traversePreOrder(folderTree, (element, level) => {
            const isParentVisible = element.parentId !== null ? internalVisibleNodes.find((node) => node.element.id === element.parentId) : true;
            const isParentExpanded = element.parentId !== null ? expandedIds.has(element.parentId) : true;

            if (isParentVisible && isParentExpanded) {
                internalVisibleNodes.push({ element, level });
            }
        });

        setVisibleNodes(internalVisibleNodes);
    }, [expandedIds, folderTree]);

    React.useEffect(() => {
        if (searchQuery === undefined || searchQuery.length === 0) {
            onMatchesChange([]);
            return;
        }

        const matches: PageSearchMatch[] = [];
        const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, "gi");

        setExpandedIds((expandedIds) => {
            const newExpandedIds = new Set(expandedIds);

            traversePreOrder(folderTree, (element) => {
                let hasMatch = false;

                let match: RegExpExecArray | null;
                while ((match = regex.exec(element.name)) !== null) {
                    hasMatch = true;

                    matches.push({
                        start: match.index,
                        end: match.index + searchQuery.length - 1,
                        focused: matches.length === 0,
                        folder: {
                            id: element.id,
                        },
                    });
                }

                if (hasMatch) {
                    newExpandedIds.add(element.id);
                    for (const ancestorId of element.mpath) {
                        newExpandedIds.add(ancestorId);
                    }
                }
            });

            onMatchesChange(matches);

            return newExpandedIds;
        });

        // This should only be executed if the searchQuery changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    React.useEffect(() => {
        if (currentMatchIndex === undefined) {
            return;
        }

        const folderId = matches?.[currentMatchIndex]?.folder?.id;

        refList.current?.scrollToItem(
            // + 1 is necessary because we artificially add the "Asset Manager" as the first item
            visibleNodes.findIndex((node) => node.element.id === folderId) + 1,
            "smart",
        );

        // This should only be executed if the currentMatchIndex changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMatchIndex]);

    const refList = useRef<List>(null);

    return (
        <AutoSizer>
            {({ height, width }) => {
                return (
                    <List
                        ref={refList}
                        height={height}
                        width={width}
                        itemCount={visibleNodes.length + 1}
                        itemSize={56}
                        overscanCount={1} // do not increase this for performance reasons
                        style={{ scrollBehavior: "smooth" }}
                    >
                        {({ index, style }) => {
                            if (loading) {
                                return (
                                    <StyledListItem offset={20 + 36} style={style}>
                                        <div>
                                            <BallTriangle sx={{ marginRight: "20px" }} />
                                            <FormattedMessage id="comet.dam.moveDamItemDialog.loading" defaultMessage="Loading ..." />
                                        </div>
                                    </StyledListItem>
                                );
                            }

                            if (index === 0) {
                                return (
                                    <ChooseFolderItem
                                        Icon={PageTree}
                                        message={<FormattedMessage id="comet.pages.dam.assetManager" defaultMessage="Asset Manager" />}
                                        offset={20}
                                        isChosen={selectedId === null}
                                        onClick={() => {
                                            onFolderClick(null);
                                        }}
                                        style={style}
                                    />
                                );
                            }

                            const node = visibleNodes[index - 1];
                            const folder = node.element;
                            const level = node.level;

                            const folderMatches = matches?.filter((match) => match.folder.id === folder.id);

                            return (
                                <ChooseFolderItem
                                    key={folder.id}
                                    Icon={folderTree.has(folder.id) ? (expandedIds.has(folder.id) ? TreeCollapse : TreeExpand) : undefined}
                                    onIconClick={() => {
                                        if (expandedIds.has(folder.id)) {
                                            setExpandedIds((expandedIds) => {
                                                const newExpandedIds = new Set(expandedIds);
                                                newExpandedIds.delete(folder.id);
                                                return newExpandedIds;
                                            });
                                        } else {
                                            setExpandedIds((expandedIds) => {
                                                const newExpandedIds = new Set(expandedIds);
                                                newExpandedIds.add(folder.id);
                                                return newExpandedIds;
                                            });
                                        }
                                    }}
                                    message={folderMatches ? <MarkedMatches text={folder.name} matches={folderMatches} /> : folder.name}
                                    offset={20 + 36 * level}
                                    isChosen={selectedId === folder.id}
                                    onClick={() => {
                                        onFolderClick(folder.id);
                                    }}
                                    style={style}
                                />
                            );
                        }}
                    </List>
                );
            }}
        </AutoSizer>
    );
};

const StyledListItem = styled(ListItem)<{ offset: number; isChosen?: boolean }>`
    display: flex;
    justify-content: space-between;

    height: 56px;
    background: white;
    cursor: pointer;
    padding-left: ${({ offset }) => offset}px;

    border-left: solid 2px transparent;
    border-right: solid 2px transparent;
    border-bottom: solid 1px ${({ theme }) => theme.palette.grey[100]};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        border-left: solid 2px ${({ theme }) => theme.palette.primary.main};
        border-right: solid 2px ${({ theme }) => theme.palette.primary.main};
        background: ${({ theme }) => theme.palette.grey[50]};
    }

    ${({ isChosen, theme }) => {
        return isChosen
            ? `
                border-top: solid 2px ${theme.palette.primary.main};
                border-bottom: solid 2px ${theme.palette.primary.main};
                border-left: solid 2px ${theme.palette.primary.main};
                border-right: solid 2px ${theme.palette.primary.main};
                
                &:last-child {
                    border-bottom: solid 2px ${theme.palette.primary.main};
                }
            `
            : null;
    }}
`;

interface ChooseFolderItemProps {
    Icon?: React.ComponentType<SvgIconProps>;
    onIconClick?: () => void;
    onClick?: () => void;
    message: React.ReactNode;
    offset: number;
    isChosen?: boolean;
    style: React.CSSProperties;
}
const ChooseFolderItem = ({ Icon, onIconClick, onClick, message, offset, isChosen = false, style }: ChooseFolderItemProps) => {
    return (
        <StyledListItem style={style} offset={Icon ? offset : offset + 20 + 16} isChosen={isChosen} onClick={onClick}>
            <div>
                {Icon && (
                    <Icon
                        sx={{ marginRight: "20px" }}
                        onClick={(event) => {
                            event.stopPropagation();
                            onIconClick?.();
                        }}
                    />
                )}{" "}
                {message}
            </div>
            <ArrowRight />
        </StyledListItem>
    );
};
