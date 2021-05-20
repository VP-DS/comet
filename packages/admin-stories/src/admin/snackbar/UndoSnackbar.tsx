import { SnackbarProvider, useSnackbarApi } from "@comet/admin";
import UndoSnackbar from "@comet/admin/lib/snackbar/UndoSnackbar";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { storiesOf } from "@storybook/react";
import * as React from "react";

let counter = 0;

const UndoSnackbarExample = () => {
    const [chosenOption, setChosenOption] = React.useState("one");
    const snackbarApi = useSnackbarApi();

    const handleUndo = (prevOption: string) => {
        setChosenOption(prevOption);
    };

    const handleChange = (event: React.MouseEvent<HTMLElement>, newOption: string) => {
        const prevOption = chosenOption;
        setChosenOption(newOption);

        snackbarApi.showSnackbar(
            <UndoSnackbar key={counter++} message={`Changed from ${chosenOption} to ${newOption}`} payload={prevOption} onUndoClick={handleUndo} />,
        );
    };

    return (
        <>
            <strong>Choose another option:</strong>
            <br />
            <br />
            <ToggleButtonGroup value={chosenOption} exclusive onChange={handleChange}>
                <ToggleButton value="one">One</ToggleButton>
                <ToggleButton value="two">Two</ToggleButton>
                <ToggleButton value="three">Three</ToggleButton>
            </ToggleButtonGroup>
        </>
    );
};

function Story() {
    return (
        <SnackbarProvider>
            <UndoSnackbarExample />
        </SnackbarProvider>
    );
}

storiesOf("@comet/admin/snackbar", module).add("Undo Snackbar", () => <Story />);
