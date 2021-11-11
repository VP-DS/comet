import { createStyles, MenuItemProps as MuiMenuItemProps, MenuList, WithStyles, withStyles } from "@material-ui/core";
import * as React from "react";
import { FieldRenderProps } from "react-final-form";

interface MenuItemProps extends MuiMenuItemProps {
    children?: React.ReactNode | ((selected: boolean) => React.ReactNode);
}
interface FinalFormMultiSelectProps extends FieldRenderProps<string, HTMLDivElement> {
    children: React.ReactElement<MenuItemProps>[];
}

export type FinalFormMultiSelectClassKey = "root";
const styles = () => {
    return createStyles<FinalFormMultiSelectClassKey, FinalFormMultiSelectProps>({
        root: {},
    });
};

function FinalFormMultiSelectComponent({ input, classes, children }: WithStyles<typeof styles> & FinalFormMultiSelectProps) {
    const handleListItemClick = (value: string) => (event: React.SyntheticEvent) => {
        if (Array.isArray(input.value)) {
            if (input.value.includes(value)) {
                if ([...input.value.filter((item) => item !== value)].length === 0) {
                    input.onChange(undefined);
                } else {
                    input.onChange([...input.value.filter((item) => item !== value)]);
                }
            } else {
                input.onChange([value, ...input.value]);
            }
        } else {
            input.onChange([value]);
        }
    };

    const items = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            if (child.props.value && typeof child.props.value === "string") {
                const selected = input.value?.includes(child.props.value);
                const children = typeof child.props.children === "function" ? child.props.children(selected) : child.props.children;

                return React.cloneElement(child, {
                    onClick: handleListItemClick(child.props.value),
                    selected,
                    children,
                });
            }
        } else {
            console.error("children have to be valid ReactElements");
        }
    });

    return (
        <MenuList
            classes={{
                root: classes.root,
            }}
        >
            {items}
        </MenuList>
    );
}

export const FinalFormMultiSelect = withStyles(styles, { name: "CometAdminFinalFormMultiSelect" })(FinalFormMultiSelectComponent);

declare module "@material-ui/core/styles/overrides" {
    interface ComponentNameToClassKey {
        CometAdminFinalFormMultiSelect: FinalFormMultiSelectClassKey;
    }
}
