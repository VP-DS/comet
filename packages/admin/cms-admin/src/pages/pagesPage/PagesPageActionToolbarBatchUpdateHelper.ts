import { ApolloClient } from "@apollo/client";

import {
    GQLPageTreeNodeVisibility,
    GQLPageTreePageFragment,
    GQLUpdatePageVisibilityMutation,
    GQLUpdatePageVisibilityMutationVariables,
} from "../../graphql.generated";
import { updatePageVisibilityMutation } from "../pageTree/PageVisibility";

export const pageTreeBatchUpdateVisibility = async (
    client: ApolloClient<unknown>,
    pageTreeNodes: GQLPageTreePageFragment[],
    visibility: GQLPageTreeNodeVisibility,
): Promise<void> => {
    await Promise.all(
        pageTreeNodes.map(async (pageTreeNode) => {
            await client.mutate<GQLUpdatePageVisibilityMutation, GQLUpdatePageVisibilityMutationVariables>({
                mutation: updatePageVisibilityMutation,
                variables: {
                    id: pageTreeNode.id,
                    input: {
                        visibility,
                    },
                },
            });
        }),
    );
    return;
};

export const pageTreeBatchResetVisibility = async (
    client: ApolloClient<unknown>,
    pageTreeNodesWithPreviousVisibility: Pick<GQLPageTreePageFragment, "id" | "visibility">[],
): Promise<void> => {
    await Promise.all(
        pageTreeNodesWithPreviousVisibility.map(async (pageTreeNodeWithPreviousVisibility) => {
            await client.mutate<GQLUpdatePageVisibilityMutation, GQLUpdatePageVisibilityMutationVariables>({
                mutation: updatePageVisibilityMutation,
                variables: {
                    id: pageTreeNodeWithPreviousVisibility.id,
                    input: {
                        visibility: pageTreeNodeWithPreviousVisibility.visibility,
                    },
                },
            });
        }),
    );
};
