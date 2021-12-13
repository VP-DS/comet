import { createStyles, Theme } from "@material-ui/core";

import { FilterBarButtonProps } from "./FilterBarButton";

export type FilterBarButtonClassKey = "root" | "open" | "hasDirtyFields" | "filterBadge";

export const styles = (theme: Theme) => {
    return createStyles<FilterBarButtonClassKey, FilterBarButtonProps>({
        root: {
            boxSizing: "border-box",
            height: 42,
            position: "relative",
            alignItems: "center",
            paddingLeft: 15,
            paddingRight: 15,
            cursor: "pointer",
            display: "flex",
            borderColor: theme.palette.grey[100],
            textTransform: "none",
            fontWeight: theme.typography.fontWeightRegular,

            "& .MuiButton-endIcon.MuiButton-iconSizeMedium > *:first-child": {
                fontSize: 12,
            },

            "& [class*='MuiSvgIcon-root']": {
                fontSize: 12,
            },

            "&:active, &:focus": {
                borderColor: theme.palette.grey[400],
                backgroundColor: "transparent",
            },

            "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: "transparent",
            },

            "& [class*='MuiButton-startIcon']": {
                marginRight: "6px",
            },

            "& [class*='MuiButton-endIcon']": {
                marginLeft: "10px",
                fontSize: 12,
            },
        },
        open: {
            borderColor: theme.palette.grey[400],
        },
        hasDirtyFields: {
            borderColor: theme.palette.grey[400],
            fontWeight: theme.typography.fontWeightBold,

            "&:disabled": {
                borderColor: theme.palette.grey[100],
            },

            "& [class*='MuiButton-endIcon']": {
                marginLeft: "6px",
            },
        },
        filterBadge: {
            marginLeft: "6px",
        },
    });
};
