import { ApolloProvider } from "@apollo/react-hooks";
import { Button, IconButton, Toolbar } from "@material-ui/core";
import { Add as AddIcon, Edit as EditIcon } from "@material-ui/icons";
import { storiesOf } from "@storybook/react";
import { EditDialog, FinalForm, Selected, Table } from "@vivid-planet/react-admin-core";
import { TextField } from "@vivid-planet/react-admin-final-form-material-ui";
import { Field } from "@vivid-planet/react-admin-form";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { ApolloLink } from "apollo-link";
import { RestLink } from "apollo-link-rest";
import * as React from "react";
import StoryRouter from "storybook-react-router";

interface IExampleRow {
    id: number;
    foo: string;
    bar: string;
}

interface IEditFormProps {
    row: IExampleRow;
    mode: "edit" | "add";
}
function EditForm(props: IEditFormProps) {
    return (
        <FinalForm
            mode={props.mode}
            initialValues={props.row}
            onSubmit={values => {
                alert(JSON.stringify(values));
            }}
        >
            <Field name="foo" component={TextField} type="text" label="Name" />
        </FinalForm>
    );
}

function Story() {
    const data: IExampleRow[] = [{ id: 1, foo: "blub", bar: "blub" }, { id: 2, foo: "blub", bar: "blub" }];

    let editDialog: EditDialog | undefined;

    return (
        <>
            <Toolbar>
                <Button
                    color="default"
                    onClick={ev => {
                        if (editDialog) editDialog.openAddDialog();
                    }}
                >
                    Hinzufügen
                    <AddIcon />
                </Button>
            </Toolbar>
            <Table
                data={data}
                totalCount={data.length}
                columns={[
                    {
                        name: "foo",
                        header: "Foo",
                    },
                    {
                        name: "bar",
                        header: "Bar",
                    },
                    {
                        name: "edit",
                        header: "Edit",
                        render: row => (
                            <IconButton
                                onClick={ev => {
                                    if (editDialog) editDialog.openEditDialog(String(row.id));
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        ),
                    },
                ]}
            />

            <EditDialog ref={ref => (editDialog = ref ? ref : undefined)}>
                {({ selectedId, selectionMode }) => (
                    <>
                        {selectionMode && (
                            <Selected selectionMode={selectionMode} selectedId={selectedId} rows={data}>
                                {(row, { selectionMode: sm }) => <EditForm mode={sm} row={row} />}
                            </Selected>
                        )}
                    </>
                )}
            </EditDialog>
        </>
    );
}

storiesOf("react-admin-core", module)
    .addDecorator(StoryRouter())
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
    .add("Table EditDialog", () => <Story />);
