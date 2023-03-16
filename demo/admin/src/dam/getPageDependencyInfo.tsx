import { GetRenderInfo } from "@comet/cms-admin";
import { GQLPageDependencyQuery, GQLPageDependencyQueryVariables } from "@src/graphql.generated";
import { Page } from "@src/pages/Page";

export const getPageDependencyInfo: GetRenderInfo = async (id: string, { apolloClient, contentScopeUrl, data: dependencyData }) => {
    const { data } = await apolloClient.query<GQLPageDependencyQuery, GQLPageDependencyQueryVariables>({
        query: Page.dependencyQuery,
        variables: {
            id,
        },
    });

    return {
        type: Page.displayName,
        name: Page.getName(data),
        secondaryInfo: Page.getSecondaryInformation?.(data),
        url: Page.getUrl(data, {
            rootColumn: dependencyData.rootColumnName,
            jsonPath: dependencyData.jsonPath,
            contentScopeUrl: contentScopeUrl,
        }),
    };
};
