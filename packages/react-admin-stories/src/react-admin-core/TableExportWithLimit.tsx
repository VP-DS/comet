import { ApolloProvider } from "@apollo/react-hooks";
import { storiesOf } from "@storybook/react";
import {
    createRestStartLimitPagingActions,
    ExcelExportButton,
    Table,
    TableQuery,
    useExportDisplayedTableData,
    useExportTableQuery,
    useTableQuery,
    useTableQueryPaging,
} from "@vivid-planet/react-admin-core";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { RestLink } from "apollo-link-rest";
import gql from "graphql-tag";
import * as React from "react";

const gqlRest = gql;

const query = gqlRest`
query users(
    $query: String
    $start : Int
    $limit : Int
) {
    photos(
        query: $query
        start: $start
        limit: $limit
    ) @rest(type: "Photos", path: "photos?_start={args.start}&_limit={args.limit}") {
        id
        albumId
        title
        thumbnailUrl
    }
}
`;
interface IPhoto {
    id: number;
    albumId: number;
    title: string;
    thumbnailUrl: string;
}

interface IQueryData {
    photos: IPhoto[];
}

interface IVariables {
    start: number;
    limit: number;
}

function Story() {
    const totalCount = 5000;
    const loadLimit = 50;
    const pagingApi = useTableQueryPaging(0);

    const { tableData, api, loading, error } = useTableQuery<IQueryData, IVariables>()(query, {
        variables: {
            start: pagingApi.current,
            limit: loadLimit,
        },
        resolveTableData: data => ({
            data: data.photos,
            totalCount,
            pagingInfo: createRestStartLimitPagingActions(pagingApi, {
                totalPages: Math.ceil(totalCount / loadLimit), // Don't calculate this in a real application
                loadLimit,
            }),
        }),
    });

    const exportCurrentPageApi = useExportDisplayedTableData({ fileName: "Custom File Name Displayed Data" });
    const exportApi = useExportTableQuery<IVariables>(api, { start: 0, limit: 5000 }, { fileName: "Custom File Name Limit 5000" });

    return (
        <TableQuery api={api} loading={loading} error={error}>
            {tableData && (
                <>
                    <ExcelExportButton exportApi={exportCurrentPageApi}>Aktuelle Seite exportieren</ExcelExportButton>
                    <ExcelExportButton exportApi={exportApi}>Export All (max. 5000 Rows)</ExcelExportButton>

                    <Table
                        exportApis={[exportCurrentPageApi, exportApi]}
                        {...tableData}
                        columns={[
                            {
                                name: "thumbnailUrl",
                                header: "Thumbnail",
                                sortable: true,
                                render: (row: IPhoto) => {
                                    return <img src={row.thumbnailUrl} />;
                                },
                                headerExcel: "Thumbnail Url",
                                renderExcel: (row: IPhoto) => {
                                    return row.thumbnailUrl;
                                },
                            },
                            {
                                name: "title",
                                header: "Title",
                                sortable: true,
                            },
                        ]}
                    />
                </>
            )}
        </TableQuery>
    );
}

storiesOf("react-admin-core", module)
    .addDecorator(story => {
        const link = ApolloLink.from([
            new RestLink({
                uri: "https://jsonplaceholder.typicode.com/",
            }),
        ]);

        const cache = new InMemoryCache();

        const client = new ApolloClient({
            link,
            cache,
        });

        return <ApolloProvider client={client}>{story()}</ApolloProvider>;
    })
    .add("Table Export With Limit", () => <Story />);
