import { Chip, MenuItem, Paper, TextField, Theme, Typography } from "@material-ui/core";
import { emphasize } from "@material-ui/core/styles/colorManipulator";
import CancelIcon from "@material-ui/icons/Cancel";
import { createStyles, withStyles } from "@material-ui/styles";
import classNames from "classnames";
import * as React from "react";
import Select from "react-select";
import AsyncSelect, { Props as ReactSelectAsyncProps } from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";
import { Props as ReactSelectProps } from "react-select/base";
import CreatableSelect, { Props as ReactSelectCreatableProps } from "react-select/creatable";
import { ValueContainerProps } from "react-select/src/components/containers";
import { ControlProps } from "react-select/src/components/Control";
import { MenuProps, NoticeProps } from "react-select/src/components/Menu";
import { MultiValueProps } from "react-select/src/components/MultiValue";
import { OptionProps } from "react-select/src/components/Option";
import { PlaceholderProps } from "react-select/src/components/Placeholder";
import { SingleValueProps } from "react-select/src/components/SingleValue";

// based on https://github.com/mui-org/material-ui/blob/master/docs/src/pages/demos/autocomplete/IntegrationReactSelect.js

const styles = (theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            height: 250,
        },
        input: {
            display: "flex",
            padding: 0,
        },
        valueContainer: {
            display: "flex",
            flexWrap: "nowrap",
            flex: 1,
            alignItems: "center",
            overflow: "hidden",
        },
        chip: {
            margin: `${theme.spacing(0.5)}px ${theme.spacing(0.25)}px`,
        },
        chipFocused: {
            backgroundColor: emphasize(theme.palette.type === "light" ? theme.palette.grey[300] : theme.palette.grey[700], 0.08),
        },
        noOptionsMessage: {
            padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
        },
        singleValue: {
            fontSize: 16,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        placeholder: {
            position: "absolute",
            left: 2,
            fontSize: 16,
        },
        paper: {
            position: "absolute",
            zIndex: 1,
            marginTop: theme.spacing(1),
            left: 0,
            right: 0,
        },
        divider: {
            height: theme.spacing(2),
        },
    });

function NoOptionsMessage<OptionType>(props: NoticeProps<OptionType>) {
    return (
        <Typography color="textSecondary" className={props.selectProps.classes.noOptionsMessage} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function inputComponent({ inputRef, ...props }: any) {
    return <div ref={inputRef} {...props} />;
}

function Control<OptionType>(props: ControlProps<OptionType>) {
    return (
        <TextField
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    className: props.selectProps.classes.input,
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
            {...props.selectProps.textFieldProps}
        />
    );
}

function Option<OptionType>(props: OptionProps<OptionType>) {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            disabled={props.isDisabled}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

function Placeholder<OptionType>(props: PlaceholderProps<OptionType>) {
    return (
        <Typography color="textSecondary" className={props.selectProps.classes.placeholder} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function SingleValue<OptionType>(props: SingleValueProps<OptionType>) {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
}

function ValueContainer<OptionType>(props: ValueContainerProps<OptionType>) {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue<OptionType>(props: MultiValueProps<OptionType>) {
    return (
        <Chip
            tabIndex={-1}
            label={props.children}
            className={classNames(props.selectProps.classes.chip, {
                [props.selectProps.classes.chipFocused]: props.isFocused,
            })}
            onDelete={props.removeProps.onClick}
            deleteIcon={<CancelIcon {...props.removeProps} />}
        />
    );
}

function Menu<OptionType>(props: MenuProps<OptionType>) {
    return (
        <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
}

const components = {
    Control,
    Menu,
    MultiValue,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
};

interface IProps<OptionType> {
    classes: {
        root: string;
        input: string;
        valueContainer: string;
        chip: string;
        chipFocused: string;
        noOptionsMessage: string;
        singleValue: string;
        placeholder: string;
        paper: string;
        divider: string;
    };
    theme: Theme;
    selectComponent: React.ComponentType<ReactSelectProps<OptionType>>;
}
class SelectWrapper<OptionType> extends React.Component<IProps<OptionType> & ReactSelectProps<OptionType>> {
    public render() {
        const { classes, theme, components: origComponents, ...rest } = this.props;
        const selectStyles = {
            input: (base: any) => ({
                ...base,
                color: theme.palette.text.primary,
                "& input": {
                    font: "inherit",
                },
            }),
        };
        const SelectComponent = this.props.selectComponent;
        // @ts-ignore (classes is not supported but we use it to pass it down to other components)
        return <SelectComponent classes={classes} styles={selectStyles} components={{ ...components, ...origComponents }} placeholder="" {...rest} />;
    }
}
const ExtendedSelectWrapper = withStyles(styles, { withTheme: true })(SelectWrapper);

// tslint:disable:max-classes-per-file
export class ReactSelect<OptionType> extends React.Component<ReactSelectProps<OptionType>> {
    public render() {
        return <ExtendedSelectWrapper selectComponent={Select} {...this.props} />;
    }
}
export class ReactSelectAsync<OptionType> extends React.Component<ReactSelectAsyncProps<OptionType>> {
    public render() {
        return <ExtendedSelectWrapper selectComponent={AsyncSelect} {...this.props} />;
    }
}
export class ReactSelectCreatable<OptionType> extends React.Component<ReactSelectCreatableProps<OptionType>> {
    public render() {
        return <ExtendedSelectWrapper selectComponent={CreatableSelect} {...this.props} />;
    }
}
export class ReactSelectAsyncCreatable<OptionType> extends React.Component<
    ReactSelectCreatableProps<OptionType> & ReactSelectAsyncProps<OptionType>
> {
    public render() {
        return <ExtendedSelectWrapper selectComponent={AsyncCreatableSelect} {...this.props} />;
    }
}
