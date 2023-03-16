import { File, FileNotMenu } from "@comet/admin-icons";
import { DocumentInterface, rewriteInternalLinks } from "@comet/cms-admin";
import { DependencyInterface } from "@comet/cms-admin/lib/documents/types";
import { PageTreePage } from "@comet/cms-admin/lib/pages/pageTree/usePageTree";
import { Chip } from "@mui/material";
import { SeoBlock } from "@src/common/blocks/SeoBlock";
import {
    GQLPage,
    GQLPageDependencyQuery,
    GQLPageDependencyQueryVariables,
    GQLPageInput,
    GQLPageTreeNodeAdditionalFieldsFragment,
    GQLPageTreeNodeCategory,
} from "@src/graphql.generated";
import { categoryToUrlParam } from "@src/utils/pageTreeNodeCategoryMapping";
import gql from "graphql-tag";
import * as React from "react";
import { FormattedMessage } from "react-intl";

import { EditPage } from "./EditPage";
import { PageContentBlock } from "./PageContentBlock";

export const Page: DocumentInterface<Pick<GQLPage, "content" | "seo">, GQLPageInput> &
    DependencyInterface<Pick<GQLPage, "content" | "seo">, GQLPageDependencyQuery, GQLPageDependencyQueryVariables> = {
    displayName: <FormattedMessage id="cometDemo.generic.page" defaultMessage="Page" />,
    editComponent: EditPage,
    getQuery: gql`
        query PageDocument($id: ID!) {
            page: pageTreeNode(id: $id) {
                id
                path
                document {
                    ... on DocumentInterface {
                        id
                        updatedAt
                    }

                    __typename
                    ... on Page {
                        content
                        seo
                    }
                }
            }
        }
    `,
    updateMutation: gql`
        mutation UpdatePage($pageId: ID!, $input: PageInput!, $lastUpdatedAt: DateTime, $attachedPageTreeNodeId: ID!) {
            savePage(pageId: $pageId, input: $input, lastUpdatedAt: $lastUpdatedAt, attachedPageTreeNodeId: $attachedPageTreeNodeId) {
                id
                content
                seo
                updatedAt
            }
        }
    `,
    inputToOutput: (input, { idsMap }) => {
        return {
            content: rewriteInternalLinks(PageContentBlock.state2Output(PageContentBlock.input2State(input.content)), idsMap),
            seo: SeoBlock.state2Output(SeoBlock.input2State(input.seo)),
        };
    },
    InfoTag: ({ page }: { page: PageTreePage & GQLPageTreeNodeAdditionalFieldsFragment }) => {
        if (page.userGroup !== "All") {
            return <Chip size="small" label={page.userGroup} />;
        }
        return null;
    },
    menuIcon: File,
    hideInMenuIcon: FileNotMenu,
    anchors: (input) => PageContentBlock.anchors?.(PageContentBlock.input2State(input.content)) ?? [],

    dependencyQuery: gql`
        query PageDependency($id: ID!) {
            page(id: $id) {
                id
                content
                seo
                pageTreeNode {
                    id
                    name
                    path
                    category
                }
            }
        }
    `,
    getName: (data: GQLPageDependencyQuery) => {
        if (data.page.pageTreeNode === null) {
            throw new Error(`Page.getName: Could not find a PageTreeNode for Page with id ${data.page.id}`);
        }

        return data.page.pageTreeNode.name;
    },
    getSecondaryInformation: (data: GQLPageDependencyQuery) => {
        if (data.page.pageTreeNode === null) {
            throw new Error(`Page.getSecondaryInformation: Could not find a PageTreeNode for Page with id ${data.page.id}`);
        }

        return data.page.pageTreeNode.path;
    },
    getUrl: (input, data: { id: string; category: GQLPageTreeNodeCategory }, { rootColumn, jsonPath, contentScopeUrl }) => {
        let dependencyRoute: string;
        if (rootColumn === "content") {
            dependencyRoute = PageContentBlock.resolveDependencyRoute(
                PageContentBlock.input2State(input["content"]),
                jsonPath.substring("root.".length),
            );
        } else {
            dependencyRoute = SeoBlock.resolveDependencyRoute(SeoBlock.input2State(input["seo"]), jsonPath.substring("root.".length));
        }

        return `${contentScopeUrl}/pages/pagetree/${categoryToUrlParam(data.category)}/${data.id}/edit/${dependencyRoute}`;
    },
};
