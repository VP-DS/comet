import { IntrospectionObjectType, IntrospectionQuery } from "graphql";

import { GeneratorOptions } from "./generate";
import { writeGenerated } from "./utils/write-generated";

export async function writeCrudGrid(targetDirectory: string, schema: IntrospectionQuery, { entityName, gridQuery }: GeneratorOptions): Promise<void> {
    const instanceEntityName = entityName[0].toLowerCase() + entityName.substring(1);

    const queryType = schema.__schema.types.find((type) => type.name === schema.__schema.queryType.name) as IntrospectionObjectType | undefined;
    if (!queryType) throw new Error("Can't find Query type in gql schema");
    const gridQueryType = queryType.fields.find((field) => field.name === gridQuery);
    if (!gridQueryType) throw new Error(`Can't find query ${gridQuery} in gql schema`);
    const hasFilter = gridQueryType.args.some((arg) => arg.name === "filter");
    const hasQuery = gridQueryType.args.some((arg) => arg.name === "query");
    const hasScope = gridQueryType.args.some((arg) => arg.name === "scope");
    const schemaEntity = schema.__schema.types.find((type) => type.kind === "OBJECT" && type.name === entityName) as
        | IntrospectionObjectType
        | undefined;
    if (!schemaEntity) throw new Error("didn't find entity in schema types");
    const gridColumnFields = schemaEntity.fields
        .filter((field) => {
            if (field.name === "id" || field.name === "updatedAt" || field.name === "createdAt" || field.name === "slug" || field.name === "scope")
                return false;
            return true;
        })
        .slice(0, 3);

    const out = `import { useQuery } from "@apollo/client";
    import {
        CrudContextMenu,
        GridFilterButton,
        muiGridFilterToGql,
        StackLink,
        Toolbar,
        ToolbarAutomaticTitleItem,
        ToolbarFillSpace,
        ToolbarItem,
        useBufferedRowCount,
        useDataGridRemote,
        usePersistentColumnState,
    } from "@comet/admin";
    import { Add as AddIcon, Edit } from "@comet/admin-icons";
    import { Alert, Button, IconButton } from "@mui/material";
    import { DataGridPro, GridColDef, GridToolbarQuickFilter } from "@mui/x-data-grid-pro";
    import { GQL${entityName}sGridQuery, GQL${entityName}sGridQueryVariables } from "@src/graphql.generated";
    import gql from "graphql-tag";
    import * as React from "react";
    import { FormattedMessage, useIntl } from "react-intl";
    
    const ${instanceEntityName}sQuery = gql\`
        query ${entityName}sGrid($offset: Int, $limit: Int, $sortColumnName: String, $sortDirection: SortDirection${
        hasQuery ? `, $query: String` : ""
    }${hasFilter ? `, $filter: ${entityName}Filter` : ""}${hasScope ? `, $scope: ${entityName}ContentScopeInput!` : ""}) {
            ${gridQuery}(offset: $offset, limit: $limit, sortColumnName: $sortColumnName, sortDirection: $sortDirection${
        hasQuery ? `, query: $query` : ""
    }${hasFilter ? `, filter: $filter` : ""}${hasScope ? `, scope: $scope` : ""}) {
                nodes {
                    id
                    ${gridColumnFields.map((field) => field.name).join("\n")}
                }
                totalCount
            }
        }
    \`;
    
    const delete${entityName}Mutation = gql\`
        mutation GridDelete${entityName}($id: ID!) {
            delete${entityName}(id: $id)
        }
    \`;

    const create${entityName}Mutation = gql\`
        mutation GridCreate${entityName}(${hasScope ? `$scope: ${entityName}ContentScopeInput!, ` : ""}$input: ${entityName}Input!) {
            create${entityName}(${hasScope ? `scope: $scope, ` : ""}input: $input) {
                id
            }
        }
    \`;

    function ${entityName}sGridToolbar() {
        return (
            <Toolbar>
                <ToolbarAutomaticTitleItem />
                <ToolbarItem>
                    <GridToolbarQuickFilter />
                </ToolbarItem>
                <ToolbarFillSpace />
                ${
                    hasFilter
                        ? `<ToolbarItem>
                <GridFilterButton />
            </ToolbarItem>`
                        : ""
                }
                <ToolbarItem>
                    <Button startIcon={<AddIcon />} component={StackLink} pageName="add" payload="add" variant="contained" color="primary">
                        <FormattedMessage id="demo.${instanceEntityName}.new${entityName}" defaultMessage="New ${entityName}" />
                    </Button>
                </ToolbarItem>
            </Toolbar>
        );
    }
    
    export function ${entityName}sGrid(): React.ReactElement {

        const intl = useIntl();
        const dataGridProps = { ...useDataGridRemote(), ...usePersistentColumnState("${entityName}sGrid") };
        const sortModel = dataGridProps.sortModel;
        ${hasScope ? `const { scope } = useContentScope();` : ""}
    

        const columns: GridColDef[] = [
            ${gridColumnFields
                .map(
                    (field) =>
                        `{ field: "${field.name}", headerName: intl.formatMessage({ id: "starter.${instanceEntityName}.${
                            field.name
                        }",  defaultMessage: "${field.description ?? field.name}" }), width: 150 },`,
                )
                .join("\n")}
            {
                field: "action",
                headerName: "",
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                    return (
                        <>
                            <IconButton component={StackLink} pageName="edit" payload={params.row.id}>
                                <Edit color="primary" />
                            </IconButton>
                            <CrudContextMenu
                                onPaste={async ({ input, client }) => {
                                    await client.mutate({
                                        mutation: create${entityName}Mutation,
                                        variables: { ${hasScope ? `scope, ` : ""}input },
                                    });
                                }}
                                onDelete={async ({ id, client }) => {
                                    await client.mutate({
                                        mutation: delete${entityName}Mutation,
                                        variables: { id },
                                    });
                                }}
                                // url={url}
                                id={params.id}
                                refetchQueries={["${entityName}sGrid"]}
                                copyData={{
                                    name: params.row.name,  //TODO avoid listing all fields and support blocks
                                    description: params.row.description,
                                    price: params.row.price,
                                }}
                            />
                        </>
                    );
                },
            },
        ];
    

        ${
            hasFilter || hasQuery
                ? `const { ${hasFilter ? `filter, ` : ""}${hasQuery ? `query, ` : ""} } = muiGridFilterToGql(columns, dataGridProps.filterModel);`
                : ""
        }
    
        const { data, loading, error } = useQuery<GQL${entityName}sGridQuery, GQL${entityName}sGridQueryVariables>(${instanceEntityName}sQuery, {
            variables: {
                ${hasScope ? `scope,` : ""}
                ${hasFilter ? `filter,` : ""}
                ${hasQuery ? `query,` : ""}
                offset: dataGridProps.page * dataGridProps.pageSize,
                limit: dataGridProps.pageSize,
                sortColumnName: sortModel && sortModel.length > 0 ? sortModel[0].field : undefined,
                sortDirection: sortModel && sortModel.length > 0 ? (sortModel[0].sort == "desc" ? "DESC" : "ASC") : undefined,
            },
        });
        const rows = data?.${gridQuery}.nodes ?? [];
        const rowCount = useBufferedRowCount(data?.${gridQuery}.totalCount);
    
        if (error) {
            return (
                <Alert severity="error">
                    <FormattedMessage id="comet.error.abstractErrorMessage" defaultMessage="An error has occurred" />
                </Alert>
            );
        }

        return (
            <div>
                <div style={{ height: 600, width: "100%" /* TODO use full height (DataGrid fullHeight will make paging scroll down) */ }}>
                    <DataGridPro
                        {...dataGridProps}
                        disableSelectionOnClick
                        rows={rows}
                        rowCount={rowCount}
                        columns={columns}
                        loading={loading}
                        components={{
                            Toolbar: ${entityName}sGridToolbar,
                        }}
                    />
                </div>
            </div>
        );
    }

    `;
    writeGenerated(`${targetDirectory}/${entityName}sGrid.tsx`, out);
}
