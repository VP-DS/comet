import { IntrospectionField, IntrospectionObjectType, IntrospectionQuery } from "graphql";

import { GeneratorOptions } from "./generate";
import { writeGenerated } from "./utils/write-generated";

export async function writeCrudForm(targetDirectory: string, schema: IntrospectionQuery, generatorOptions: GeneratorOptions): Promise<void> {
    const { entityName } = generatorOptions;
    const instanceEntityName = entityName[0].toLowerCase() + entityName.substring(1);

    const schemaEntity = schema.__schema.types.find((type) => type.kind === "OBJECT" && type.name === entityName) as
        | IntrospectionObjectType
        | undefined;
    if (!schemaEntity) throw new Error("didn't find entity in schema types");
    const formFields = schemaEntity.fields.filter((field) => {
        if (field.name === "id" || field.name === "updatedAt" || field.name === "createdAt" || field.name === "scope") return false;
        return true;
    });

    const hasScope = schemaEntity.fields.some((field) => {
        return field.name === "scope";
    });

    const outGql = `
    import { gql } from "@apollo/client";

    export const ${instanceEntityName}FormFragment = gql\`
        fragment ${entityName}Form on ${entityName} {
            ${formFields.map((field) => field.name).join("\n")}
        }
        \`;
    
    export const ${instanceEntityName}FormQuery = gql\`
        query ${entityName}Form($id: ID!) {
            ${instanceEntityName}(id: $id) {
                id
                updatedAt
                ...${entityName}Form
            }
        }
        \${${instanceEntityName}FormFragment}
    \`;
    
    export const ${instanceEntityName}CheckForChangesQuery = gql\`
        query ${entityName}FormCheckForChanges($id: ID!) {
            ${instanceEntityName}(id: $id) {
                updatedAt
            }
        }
    \`;

    export const create${entityName}Mutation = gql\`
        mutation ${entityName}FormCreate(${hasScope ? `$scope: ${entityName}ContentScopeInput!, ` : ""}$input: ${entityName}Input!) {
            create${entityName}(${hasScope ? `scope: $scope, ` : ""}input: $input) {
                id
                updatedAt
                ...${entityName}Form
            }
        }
        \${${instanceEntityName}FormFragment}
    \`
    
    export const update${entityName}Mutation = gql\`
        mutation ${entityName}FormUpdate($id: ID!, $input: ${entityName}Input!, $lastUpdatedAt: DateTime) {
            update${entityName}(id: $id, input: $input, lastUpdatedAt: $lastUpdatedAt) {
                id
                updatedAt
                ...${entityName}Form
            }
        }
        \${${instanceEntityName}FormFragment}
    \`;
    
    `;
    writeGenerated(`${targetDirectory}/${entityName}Form.gql.tsx`, outGql);

    const numberFields = formFields.filter((field) => {
        const type = field.type.kind === "NON_NULL" ? field.type.ofType : field.type;
        return type.kind == "SCALAR" && (type.name == "Float" || type.name == "Int");
    });

    const out = `
    import { useApolloClient, useQuery } from "@apollo/client";
    import {
        Field,
        FinalForm,
        FinalFormInput,
        FinalFormSaveSplitButton,
        MainContent,
        Toolbar,
        ToolbarActions,
        ToolbarFillSpace,
        ToolbarItem,
        ToolbarTitleItem,
        useFormApiRef,
        useStackApi,
        useStackSwitchApi,
    } from "@comet/admin";
    import { ArrowLeft } from "@comet/admin-icons";
    import { BlockState, createFinalFormBlock } from "@comet/blocks-admin";
    import { EditPageLayout, resolveHasSaveConflict, useFormSaveConflict } from "@comet/cms-admin";
    import { CircularProgress, IconButton } from "@mui/material";
    import {
        GQL${entityName}FormCheckForChangesQuery,
        GQL${entityName}FormCheckForChangesQueryVariables,
        GQL${entityName}FormCreateMutation,
        GQL${entityName}FormCreateMutationVariables,
        GQL${entityName}FormFragment,
        GQL${entityName}FormUpdateMutation,
        GQL${entityName}FormUpdateMutationVariables,
        GQL${entityName}FormQuery,
        GQL${entityName}FormQueryVariables,
    } from "@src/graphql.generated";
    import { filter } from "graphql-anywhere";
    import isEqual from "lodash.isequal";
    import React from "react";
    import { FormattedMessage } from "react-intl";

    import { create${entityName}Mutation, ${instanceEntityName}CheckForChangesQuery, ${instanceEntityName}FormFragment, ${instanceEntityName}FormQuery, update${entityName}Mutation } from "./ProductForm.gql";
    ${
        generatorOptions.rootBlocks
            ? Object.entries(generatorOptions.rootBlocks).map(
                  ([rootBlockKey, rootBlock]) => `import { ${rootBlock.name} } from "${rootBlock.import}";`,
              )
            : ""
    }


    interface FormProps {
        id?: string;
    }
    
    ${
        generatorOptions.rootBlocks
            ? `const rootBlocks = {
                ${Object.entries(generatorOptions.rootBlocks).map(([rootBlockKey, rootBlock]) => `${rootBlockKey}: ${rootBlock.name}`)}
                };`
            : ""
    }
    
    type FormState = ${
        numberFields.length > 0
            ? `Omit<GQL${entityName}FormFragment, ${numberFields.map((field) => `"${field.name}"`).join(", ")}>`
            : `GQL${entityName}FormFragment`
    } & {
        ${numberFields.map((field) => `${field.name}: string;`).join("\n")}
        ${
            generatorOptions.rootBlocks
                ? Object.keys(generatorOptions.rootBlocks).map((rootBlockKey) => `${rootBlockKey}: BlockState<typeof rootBlocks.${rootBlockKey}>;`)
                : ""
        }
    };
    
    export function ${entityName}Form({ id }: FormProps): React.ReactElement {
        const stackApi = useStackApi();
        const client = useApolloClient();
        const mode = id ? "edit" : "add";
        const formApiRef = useFormApiRef<FormState>();
        const stackSwitchApi = useStackSwitchApi();
        const createMutationResponseRef = React.useRef<GQL${entityName}FormCreateMutation>();
    
        const { data, error, loading, refetch } = useQuery<GQL${entityName}FormQuery, GQL${entityName}FormQueryVariables>(${instanceEntityName}FormQuery, {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            variables: { id: id! },
            skip: !id,
        });
    
        const initialValues: Partial<FormState> = data?.${instanceEntityName}
            ? {
                  ...filter<GQL${entityName}FormFragment>(${instanceEntityName}FormFragment, data.${instanceEntityName}),
                  ${numberFields.map((field) => `${field.name}: String(data.${instanceEntityName}.${field.name}),`).join("\n")}
                  ${
                      generatorOptions.rootBlocks
                          ? Object.keys(generatorOptions.rootBlocks).map(
                                (rootBlockKey) =>
                                    `${rootBlockKey}: rootBlocks.${rootBlockKey}.input2State(data.${instanceEntityName}.${rootBlockKey}),`,
                            )
                          : ""
                  }
              }
            : {
                ${
                    generatorOptions.rootBlocks
                        ? Object.keys(generatorOptions.rootBlocks).map(
                              (rootBlockKey) => `${rootBlockKey}: rootBlocks.${rootBlockKey}.defaultValues(),`,
                          )
                        : ""
                }
              };
    
        const saveConflict = useFormSaveConflict({
            checkConflict: async () => {
                if (!id) return false;
                const { data: hasConflictData } = await client.query<GQL${entityName}FormCheckForChangesQuery, GQL${entityName}FormCheckForChangesQueryVariables>({
                    query: ${instanceEntityName}CheckForChangesQuery,
                    variables: { id },
                    fetchPolicy: "no-cache",
                });
                return resolveHasSaveConflict(data?.${instanceEntityName}?.updatedAt, hasConflictData?.${instanceEntityName}?.updatedAt);
            },
            formApiRef,
            loadLatestVersion: async () => {
                await refetch();
            },
        });
    
        const handleSubmit = async (state: FormState) => {
            if (await saveConflict.checkForConflicts()) throw new Error("Conflicts detected");
            createMutationResponseRef.current = undefined;
    
            const output = {
                ...state,
                ${numberFields.map((field) => `${field.name}: parseFloat(state.${field.name}),`).join("\n")}
                ${
                    generatorOptions.rootBlocks
                        ? Object.keys(generatorOptions.rootBlocks).map(
                              (rootBlockKey) => `${rootBlockKey}: rootBlocks.${rootBlockKey}.state2Output(state.${rootBlockKey}),`,
                          )
                        : ""
                }
            };
    
            if (mode === "edit") {
                if (!id) throw new Error();
                await client.mutate<GQL${entityName}FormUpdateMutation, GQL${entityName}FormUpdateMutationVariables>({
                    mutation: update${entityName}Mutation,
                    variables: { id, input: output, lastUpdatedAt: data?.${instanceEntityName}?.updatedAt },
                });
            } else {
                const { data: mutationReponse } = await client.mutate<GQL${entityName}FormCreateMutation, GQL${entityName}FormCreateMutationVariables>({
                    mutation: create${entityName}Mutation,
                    variables: { input: output },
                });
                if (mutationReponse) {
                    createMutationResponseRef.current = mutationReponse;
                }
            }
        };
    
        if (error) {
            return <FormattedMessage id="demo.common.error" defaultMessage="Ein Fehler ist aufgetreten. Bitte versuchen Sie es später noch einmal." />;
        }
    
        if (loading) {
            return <CircularProgress />;
        }
    
        return (
            <FinalForm<FormState>
                apiRef={formApiRef}
                onSubmit={handleSubmit}
                mode={mode}
                initialValues={initialValues}
                initialValuesEqual={isEqual} //required to compare block data correctly
                onAfterSubmit={(values, form) => {
                    //don't go back automatically
                }}
            >
                {({ values }) => (
                    <EditPageLayout>
                        {saveConflict.dialogs}
                        <Toolbar>
                            <ToolbarItem>
                                <IconButton onClick={stackApi?.goBack}>
                                    <ArrowLeft />
                                </IconButton>
                            </ToolbarItem>
                            <ToolbarTitleItem>
                                {values.title ? values.title : <FormattedMessage id="comet.${instanceEntityName}.${instanceEntityName}Detail" defaultMessage="${entityName} Detail" />}
                            </ToolbarTitleItem>
                            <ToolbarFillSpace />
                            <ToolbarActions>
                                <FinalFormSaveSplitButton
                                    onNavigateToEditPage={() => {
                                        const id = createMutationResponseRef.current?.create${entityName}.id;
                                        if (mode == "add" && id) {
                                            stackSwitchApi.activatePage("edit", id);
                                        }
                                    }}
                                />
                            </ToolbarActions>
                        </Toolbar>
                        <MainContent>
                            ${formFields.map((field) => generateField(field, generatorOptions)).join("\n")}
                        </MainContent>
                    </EditPageLayout>
                )}
            </FinalForm>
        );
    }
    `;

    writeGenerated(`${targetDirectory}/${entityName}Form.tsx`, out);
}

function generateField(field: IntrospectionField, generatorOptions: GeneratorOptions) {
    const { entityName } = generatorOptions;
    const instanceEntityName = entityName[0].toLowerCase() + entityName.substring(1);

    const label = field.description ?? field.name;
    const type = field.type.kind === "NON_NULL" ? field.type.ofType : field.type;
    if (type.kind === "SCALAR" && type.name == "JSONObject") {
        //block?
        const rootBlock = generatorOptions.rootBlocks ? generatorOptions.rootBlocks[field.name] : undefined;
        if (!rootBlock) return "";
        return `<Field name="${field.name}" isEqual={isEqual}>
            {createFinalFormBlock(rootBlocks.${field.name})}
        </Field>`;
    } else if (type.kind === "ENUM") {
        //TODO
        return "";
    } else if (type.kind === "SCALAR" && type.name === "Boolean") {
        return `<Field ${field.type.kind === "NON_NULL" ? "required" : ""} name="${field.name}" type="checkbox" label="${label}">
                    {(props) => <FormControlLabel label="" control={<FinalFormCheckbox {...props} />} />}
                </Field>`;
    } else {
        let component;
        let additionalProps = "";
        if (type.kind === "SCALAR" && type.name === "DateTime") {
            component = "FinalFormDatePicker";
        } else if (type.kind === "SCALAR" && type.name === "String") {
            component = "FinalFormInput";
        } else if (type.kind === "SCALAR" && type.name === "Float") {
            component = "FinalFormInput";
            additionalProps += 'type="number"';
            //TODO MUI suggest not using type=number https://mui.com/material-ui/react-text-field/#type-quot-number-quot
        } else if (type.kind === "SCALAR" && type.name === "Int") {
            component = "FinalFormInput";
            additionalProps += 'type="number"';
            //TODO
        } else {
            //unknown type
            return "";
        }
        return `<Field ${field.type.kind === "NON_NULL" ? "required" : ""}
                    fullWidth
                    name="${field.name}"
                    component={${component}}
                    ${additionalProps}
                    label={<FormattedMessage id="demo.${instanceEntityName}.${field.name}" defaultMessage="${label}" />}
                />`;
    }
}
