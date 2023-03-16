import { GetRenderInfo } from "@comet/cms-admin";
import { GQLPageDependencyQuery, GQLPageDependencyQueryVariables } from "@src/graphql.generated";
import { Page } from "@src/pages/Page";

export const getPageDependencyInfo: GetRenderInfo = async (id: string, { apolloClient, contentScope, data: dependencyData }) => {
    const { data } = await apolloClient.query<GQLPageDependencyQuery, GQLPageDependencyQueryVariables>({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
            contentScopeUrl: contentScope.match.url,
        }),
    };
};
