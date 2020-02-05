import { Button, ListItem } from "@material-ui/core";
import { storiesOf } from "@storybook/react";
import { ReactSelect } from "@vivid-planet/material-ui-react-select";
import * as React from "react";

function Story() {
    const options = [
        { value: "chocolate", label: "Chocolate" },
        { value: "strawberry", label: "Strawberry", isDisabled: true },
        { value: "vanilla", label: "Vanilla" },
    ];
    return (
        <div style={{ width: "300px" }}>
            <ListItem>
                <Button component={"button"} disableTouchRipple>
                    blah
                </Button>
            </ListItem>

            <ReactSelect options={options} />
        </div>
    );
}

storiesOf("material-ui-react-select", module).add("React Select Disabled Option", () => <Story />);
