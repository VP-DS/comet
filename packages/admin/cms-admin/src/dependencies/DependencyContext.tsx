import { ApolloClient } from "@apollo/client";
import * as React from "react";

import { GQLDependency } from "../graphql.generated";

export interface DependencyRenderInfoOptions {
    data: Pick<GQLDependency, "rootGraphqlObjectType" | "rootId" | "rootColumnName" | "jsonPath">;
    apolloClient: ApolloClient<unknown>;
    contentScopeUrl: string;
}
export interface DependencyRenderInfo {
    type: React.ReactNode;
    name: React.ReactNode;
    secondaryInfo?: React.ReactNode;
    url?: string;
}

export type GetRenderInfo = (id: string, options: DependencyRenderInfoOptions) => Promise<DependencyRenderInfo> | DependencyRenderInfo;

export interface DependencyConfig {
    dependencyRenderInfoProvider?: {
        [key: string]: GetRenderInfo;
    };
}

const DependencyContext = React.createContext<DependencyConfig | undefined>(undefined);

export const DependencyProvider: React.FunctionComponent<{ value: DependencyConfig }> = ({ children, value }) => {
    return <DependencyContext.Provider value={value}>{children}</DependencyContext.Provider>;
};

export const useDependencyConfig = (): DependencyConfig => {
    const context = React.useContext(DependencyContext);
    return context ?? {};
};
